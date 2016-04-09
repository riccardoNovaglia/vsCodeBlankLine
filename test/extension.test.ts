import * as assert from 'assert';

import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as sinon from 'sinon';

import BlankLineChecker from '../src/BlankLineChecker';
import VSCodeAdapter from '../src/VSCodeAdapter'
import DocumentStubBuilder from  './DocumentStubBuilder'

let sandbox;
let checker;
let addLineStub;

suite("Blank Line Extension Tests", () => {

    setup(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(VSCodeAdapter.prototype, 'init');
        checker = new BlankLineChecker();
        addLineStub = sandbox.stub(VSCodeAdapter.prototype, 'appendToFile');
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

});


function someDocument() {
    return new DocumentStubBuilder(sandbox);
}

function theExtensionIsActivated() {
    checker.addBlankLineIfNeeded();
}

function addBlankLinesCallCountIs(times) {
    assert.equal(addLineStub.callCount, times);
}
