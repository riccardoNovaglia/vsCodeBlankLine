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
let revertSpy;
let stubVSAdapter;

suite("Blank Line Extension Tests", () => {

    setup(() => {
        sandbox = sinon.sandbox.create();
        stubVSAdapter = sinon.createStubInstance(VSCodeAdapter);
        checker = new BlankLineChecker();
        stubVSAdapter.appendToFile = (char, callback) => { callback(true); };
        stubVSAdapter.revert = (fileWasSaved) => {
            fileWasSaved(true);
            theExtensionIsActivated();
         };
        addLineSpy = sinon.spy(stubVSAdapter, 'appendToFile');
        revertSpy = sinon.spy(stubVSAdapter, 'revert');
        stubVSAdapter.alertConfigValue = () => { return true };
    });
    teardown(() => {
        sandbox.restore();
    });

    test("Adds a blank line to a file that doesn't have one and is not blank", () => {
        someDocument().withoutBlankLine().build();

        theExtensionIsActivated()

        addBlankLinesCallCountIs(1);
    });

    test("Does not append to a file that has a blank line at its end", () => {
        someDocument().build();

        theExtensionIsActivated();

        addBlankLinesCallCountIs(0);
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

function revertCallCountIs(times) {
    assert.equal(revertSpy.callCount, times);
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
