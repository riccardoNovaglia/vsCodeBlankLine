import * as assert from 'assert';

import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as sinon from 'sinon';

import BlankLineChecker from '../src/BlankLineChecker';
import VSCodeAdapter from '../src/VSCodeAdapter'

let sandbox;
let checker;

suite("Blank Line Extension Tests", () => {

    setup(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(VSCodeAdapter.prototype, 'init');
        checker = new BlankLineChecker();
    });
    teardown(() => {
        sandbox.restore();
    });

    test("Adds a blank line to a file that doesn't have one and is not blank", () => {
        // given
        aDocumentWithANonBlankLastLine();
        let addLineStub = sandbox.stub(VSCodeAdapter.prototype, 'addBlankLineAndSaveFile');

        // when
        checker.addBlankLineIfNeeded();

        // then
        assert.equal(addLineStub.callCount, 1);
    });
});

function aDocumentWithANonBlankLastLine() {
    sandbox.stub(VSCodeAdapter.prototype, 'docURI').returns("any/path");
    sandbox.stub(VSCodeAdapter.prototype, 'lastDocumentLineIsEmpty').returns(false);
    sandbox.stub(VSCodeAdapter.prototype, 'docLinesCount').returns(123);

}
