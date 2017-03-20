import {SomeDocument} from "./DocumentStubBuilder";
import VsCodeAdapterHelper from "./VsCodeAdapterHelper";
import VSCodeAdapter from "../src/VSCodeAdapter";
import BlankLineChecker from "../src/BlankLineChecker";
import * as assert from "assert";

let sandbox;
let checker: BlankLineChecker;
let stubVSAdapter: VSCodeAdapter;
let vsAdapterHelper: VsCodeAdapterHelper;

suite("stuff", () => {
    setup(() => {
        sandbox = sinon.sandbox.create();

        vsAdapterHelper = new VsCodeAdapterHelper(sinon);
        stubVSAdapter = vsAdapterHelper.stubVSAdapter;
        checker = new BlankLineChecker();
    });
    teardown(() => {
        sandbox.restore();
    });

    test("Reverts the file if the user presses the revert button", () => {
        SomeDocument(stubVSAdapter).withoutBlankLine().build();
        vsAdapterHelper.theUserWillHitTheRevertButton();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
        assert.equal(vsAdapterHelper.revertSpy.callCount, 1);
    });

    test("Appends again after the revert button was hit", () => {
        SomeDocument(stubVSAdapter).withoutBlankLine().build();
        vsAdapterHelper.theUserWillHitTheRevertButton();
        checker.addBlankLineIfNeeded(stubVSAdapter);

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 2);
    });

    test("Stops appending if the user presses the not this file type button", () => {
        vsAdapterHelper.theUserWillHitTheNotThisFileTypeButton();
        SomeDocument(stubVSAdapter).withoutBlankLine().build();
        checker.addBlankLineIfNeeded(stubVSAdapter);

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
        assert.equal(vsAdapterHelper.revertSpy.callCount, 1);
    });

    test("Does not append to another file of the same type if the not this type button was hit", () => {
        vsAdapterHelper.theUserWillHitTheNotThisFileTypeButton();
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri("a/file.txt").build();
        checker.addBlankLineIfNeeded(stubVSAdapter);
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri('another/file.txt').build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
    });

    test("Appends to a different file after the not this file type button was hit", () => {
        vsAdapterHelper.theUserWillHitTheNotThisFileTypeButton();
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri("another/file.json").build();
        checker.addBlankLineIfNeeded(stubVSAdapter);
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri('another/file').build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 2);
    });

});
