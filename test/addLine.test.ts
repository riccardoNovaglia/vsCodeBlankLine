import * as assert from "assert";
import BlankLineChecker from "../src/BlankLineChecker";
import VSCodeAdapter from "../src/VSCodeAdapter";
import VsCodeAdapterHelper from "./VsCodeAdapterHelper";
import * as sinon from "sinon";
import {SomeDocument} from "./DocumentStubBuilder";

let sandbox;
let checker: BlankLineChecker;
let stubVSAdapter: VSCodeAdapter;
let vsAdapterHelper: VsCodeAdapterHelper;

suite("Blank Line Extension Tests", () => {

    setup(() => {
        sandbox = sinon.sandbox.create();

        vsAdapterHelper = new VsCodeAdapterHelper(sinon);
        stubVSAdapter = vsAdapterHelper.stubVSAdapter;
        checker = new BlankLineChecker();
    });
    teardown(() => {
        sandbox.restore();
    });

    test("Adds a blank line to a file that doesn't have one and is not blank", () => {
        SomeDocument(stubVSAdapter).withoutBlankLine().build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
    });

    test("Does not append to a file that has a blank line at its end", () => {
        SomeDocument(stubVSAdapter).build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 0);
    });

    test("Does not append to a file that is blank", () => {
        SomeDocument(stubVSAdapter).withLineCount(0).build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 0);
    });

    test("Appends to a file with only 1 line", () => {
        SomeDocument(stubVSAdapter).withoutBlankLine().withLineCount(1).build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
    });


    test("Should exclude files even if they do not have a specific type extension", () => {
        vsAdapterHelper.theUserWillHitTheNotThisFileTypeButton();
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri("another/file").build();
        checker.addBlankLineIfNeeded(stubVSAdapter);

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
    });

    test("Should not run for a file for which the extension is excluded in config", () => {
        vsAdapterHelper.theConfigContainsFilesTypesToExcludeContaining([".txt"]);
        SomeDocument(stubVSAdapter).withoutBlankLine().withUri("another/file.txt").build();
        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 0);
    });

    test("Does not revert the file if the Close button is hit", () => {
        vsAdapterHelper.theUserWillHitTheCloseButton();
        SomeDocument(stubVSAdapter).withoutBlankLine().build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(vsAdapterHelper.addLineSpy.callCount, 1);
        assert.equal(vsAdapterHelper.revertSpy.callCount, 0);
    });

    test("Displays an error message if the file could not be saved", () => {
        let errorMessageSpy = vsAdapterHelper.aSpyForDisplayErrorMessage();
        vsAdapterHelper.savefileWillFail();
        SomeDocument(stubVSAdapter).withoutBlankLine().build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(errorMessageSpy.callCount, 1);
    });

    test("Should display the revert dialog if the config is set to true", () => {
        let displayDialogSpy = vsAdapterHelper.aSpyForDisplayRevertDialog();
        SomeDocument(stubVSAdapter).withoutBlankLine().build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(displayDialogSpy.callCount, 1);
    });

    test("Should not display the revert dialog if the config sets it to false", () => {
        let displayDialogSpy = vsAdapterHelper.aSpyForDisplayRevertDialog();
        vsAdapterHelper.theConfigSaysNotToDisplayTheDialog();
        SomeDocument(stubVSAdapter).withoutBlankLine().build();

        checker.addBlankLineIfNeeded(stubVSAdapter);

        assert.equal(displayDialogSpy.callCount, 0);
    });
});
