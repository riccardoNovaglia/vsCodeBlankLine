import VSCodeAdapter from "../src/VSCodeAdapter";

export default class VsCodeAdapterHelper {

    sinon;
    addLineSpy;
    revertSpy;
    stubVSAdapter: VSCodeAdapter;

    constructor(sinon) {
        this.sinon = sinon;
        this.stubVSAdapter = sinon.createStubInstance(VSCodeAdapter);
        this.stubVSAdapter.appendToFile = (char, callback) => {
            callback(true);
        };
        this.stubVSAdapter.revert = (fileWasSaved) => {
            fileWasSaved(true);
            // theExtensionIsActivated();
        };
        this.addLineSpy = sinon.spy(this.stubVSAdapter, 'appendToFile');
        this.revertSpy = sinon.spy(this.stubVSAdapter, 'revert');
        this.stubVSAdapter.getAlertConfigValue = () => {
            return true
        };
        this.stubVSAdapter.getFileTypesToExclude = () => {
            return new Set()
        };
    }

    public theUserWillHitTheRevertButton() {
        this.stubVSAdapter.displayRevertMessage = (userInput) => {
            userInput({isClose: false, isRevert: true, isNotThisFile: false});
        };
    }

    public theUserWillHitTheNotThisFileTypeButton() {
        this.stubVSAdapter.displayRevertMessage = (userInput) => {
            userInput({isClose: false, isRevert: false, isNotThisFile: true});
        };
    }

    public theUserWillHitTheCloseButton() {
        this.stubVSAdapter.displayRevertMessage = (userInput) => {
            userInput({isClose: true, isRevert: false, isNotThisFile: false});
        };
    }

    public savefileWillFail() {
        this.stubVSAdapter.appendToFile = (EOL, wasSavedCallback) => {
            wasSavedCallback(false);
        };
    }

    public aSpyForDisplayErrorMessage() {
        this.stubVSAdapter.displayFileCouldNotBeSavedError = () => {
        };
        return this.sinon.spy(this.stubVSAdapter, 'displayFileCouldNotBeSavedError');
    }

    public aSpyForDisplayRevertDialog() {
        this.stubVSAdapter.displayRevertMessage = () => {
        };
        return this.sinon.spy(this.stubVSAdapter, 'displayRevertMessage');
    }

    public theConfigSaysNotToDisplayTheDialog() {
        this.stubVSAdapter.getAlertConfigValue = () => {
            return false
        };
    }

    public theConfigContainsFilesTypesToExcludeContaining(typesToExclude: Array<string>) {
        this.stubVSAdapter.getFileTypesToExclude = () => {
            return new Set(typesToExclude)
        };
    }
}
