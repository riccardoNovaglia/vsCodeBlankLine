import * as assert from 'assert';

import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as sinon from 'sinon';

import BlankLineChecker from '../src/BlankLineChecker';
import VSCodeAdapter from '../src/VSCodeAdapter'
import DocumentStubBuilder from  './DocumentStubBuilder'

let sandbox;
let checker;
let addLineSpy;
let removeLineSpy;
let revertSpy;
let stubVSAdapter;

suite("Blank Line Extension Tests", () => {

    setup(() => {
        sandbox = sinon.sandbox.create();
        stubVSAdapter = sinon.createStubInstance(VSCodeAdapter);
        checker = new BlankLineChecker();
        stubVSAdapter.appendToFile = (char, callback) => { callback(true) };
        stubVSAdapter.revert = (EOL, lastOperation, fileWasSaved) => {
            fileWasSaved(true);
            theExtensionIsActivated();
        };
        stubVSAdapter.removeBlankLines = (count, callback) => { callback(true) };
        addLineSpy = sinon.spy(stubVSAdapter, 'appendToFile');
        removeLineSpy = sinon.spy(stubVSAdapter, 'removeBlankLines');
        revertSpy = sinon.spy(stubVSAdapter, 'revert');
        stubVSAdapter.alertConfigValue = () => { return true };
        stubVSAdapter.removeExtraLinesConfigValue = () => { return true };
    });
    teardown(() => {
        sandbox.restore();
    });

    test("Adds a blank line to a file that doesn't have one and is not blank", () => {
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated()

        addBlankLinesCallCountIs(1);
    });

    test("Removes extra blank lines", () => {
        someDocument().withFinalBlankLines(3).build();

        theExtensionIsActivated();

        removeBlankLinesCallCountIs(1);
        removeBlankLinesCalledWith(2);
    });

    test("Does not append to a file that is blank", () => {
        someDocument().withLineCount(0).build();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(0);
    });

    test("Appends to a file with only 1 line", () => {
        someDocument().withoutBlankLine().withLineCount(1).build();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(1);
    });

    test("Reverts the file if the user presses the revert button", () => {
        someDocument().withoutBlankLine().build();
        theUserWillHitTheRevertButton();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(1);
        revertCallCountIs(1);
        revertCalledWithLastOperation({type: "add", count: 1});
    });

    test("Returns removed blank lines if revert button was hit", () => {
        someDocument().withFinalBlankLines(3).build();
        theUserWillHitTheRevertButton();

        theExtensionIsActivated();

        removeBlankLinesCallCountIs(1);
        removeBlankLinesCalledWith(2);
        revertCallCountIs(1);
        revertCalledWithLastOperation({type: "remove", count: 2});
    });

    test("Does not remove blank lines if config says not to", () => {
        someDocument().withFinalBlankLines(3).build();
        theConfigSaysNotToRemoveLastEmptyLines();

        theExtensionIsActivated();

        removeBlankLinesCallCountIs(0);
    });

    test("Appends again after the revert button was hit", () => {
        someDocument().withoutBlankLine().build();
        theUserWillHitTheRevertButton();
        theExtensionIsActivated();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(2);
    });

    test("Stops appeding if the user presses the not this file button", () => {
        theUserWillHitTheNotThisFileButton();
        someDocument().withoutBlankLine().build();
        theExtensionIsActivated();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(1);
        revertCallCountIs(1);
    });

    test("Appends to a different file after the not this file button was hit", () => {
        theUserWillHitTheNotThisFileButton();
        someDocument().withoutBlankLine().build();
        theExtensionIsActivated();
        someDocument().withoutBlankLine().withUri('another/file').build();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(2);
    });

    test("Does not revert the file if the Close button is hit", () => {
        theUserWillHitTheCloseButton();
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(1);
        revertCallCountIs(0);
    });

    test("Displays an error message if the file could not be saved", () => {
        let errorMessageSpy = aSpyForDisplayErrorMessage();
        savefileWillFail();
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated();

        assert.equal(errorMessageSpy.callCount, 1);
    });

     test("Should display the revert dialog if the config is set to true", () => {
        let displayDialogSpy = aSpyForDisplayRevertDialog()
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated();

        assert.equal(displayDialogSpy.callCount, 1);
    });

    test("Should not display the revert dialog if the config sets it to false", () => {
        let displayDialogSpy = aSpyForDisplayRevertDialog()
        theConfigSaysNotToDisplayTheDialog();
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated();

        assert.equal(displayDialogSpy.callCount, 0);
    });
});


function someDocument() {
    return new DocumentStubBuilder(stubVSAdapter);
}

function theExtensionIsActivated() {
    checker.addBlankLineIfNeeded(stubVSAdapter);
}

function addBlankLinesCallCountIs(times) {
    assert.equal(addLineSpy.callCount, times);
}

function removeBlankLinesCallCountIs(times) {
    assert.equal(removeLineSpy.callCount, times);
}

function removeBlankLinesCalledWith(count) {
    assert(removeLineSpy.calledWith(count));
}

function revertCallCountIs(times) {
    assert.equal(revertSpy.callCount, times);
}

function revertCalledWithLastOperation(lastOperation) {
    assert(revertSpy.calledWith(sinon.match.any, sinon.match(lastOperation), sinon.match.any));
}

function theUserWillHitTheRevertButton() {
    stubVSAdapter.displayRevertMessage = (userInput) => {
        userInput({isClose: false, isRevert: true, isNotThisFile: false});
    };
}

function theUserWillHitTheNotThisFileButton() {
    stubVSAdapter.displayRevertMessage = (userInput) => {
        userInput({isClose: false, isRevert: false, isNotThisFile: true});
    };
}

function theUserWillHitTheCloseButton() {
    stubVSAdapter.displayRevertMessage = (userInput) => {
        userInput({isClose: true, isRevert: false, isNotThisFile: false});
    };
}

function savefileWillFail() {
    stubVSAdapter.appendToFile = (EOL, wasSavedCallback) => {
        wasSavedCallback(false);
    };
}

function aSpyForDisplayErrorMessage() {
    stubVSAdapter.displayFileCouldNotBeSavedError = () => { }
    return sinon.spy(stubVSAdapter, 'displayFileCouldNotBeSavedError');
}

function aSpyForDisplayRevertDialog() {
    stubVSAdapter.displayRevertMessage = () => { }
    return sinon.spy(stubVSAdapter, 'displayRevertMessage');
}

function theConfigSaysNotToDisplayTheDialog() {
    stubVSAdapter.alertConfigValue = () => { return false };
}

function theConfigSaysNotToRemoveLastEmptyLines() {
    stubVSAdapter.removeExtraLinesConfigValue = () => { return false };
}
