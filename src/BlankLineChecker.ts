import VSCodeAdapter from "./VSCodeAdapter";

export default class BlankLineChecker {

    private stopThat = "";
    private skipOne = false;

    private vsAdapter = new VSCodeAdapter();
    private shouldDisplayRevertMessage = true;

    public addBlankLineIfNeeded(): void {
        if (this.shouldNotSkipDoc()) {
            this.analyseDocContent();
        } else {
            if (this.skipOne) {
                this.skipOne = false;
            }
        }
    }

    private analyseDocContent() {
        let checker = this;
        if (this.vsAdapter.docLinesCount() > 1 && !this.vsAdapter.lastDocumentLineIsEmpty()) {
            this.vsAdapter.addBlankLineAndSaveFile();
            if (this.shouldDisplayRevertMessage) {
                this.displayRevertMessage();
            }
        }
    }

    private displayRevertMessage() {
        this.vsAdapter.displayRevertMessage(
            (userPressedStopThat) => {
                if (userPressedStopThat) {
                    this.stopThat = this.vsAdapter.docURI();
                } else {
                    this.skipOne = true;
                }
                this.vsAdapter.revert();
            });
    }

    private shouldNotSkipDoc() {
        return this.vsAdapter.docURI() !== this.stopThat && !this.skipOne;
    }

    dispose() {
    }
}
