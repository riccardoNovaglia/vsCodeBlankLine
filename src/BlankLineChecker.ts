import VSCodeAdapter from "./VSCodeAdapter";
import { EOL } from 'os'

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
        if (this.vsAdapter.docLineCount() > 0 && !this.vsAdapter.lastDocumentLineIsEmpty()) {
            this.vsAdapter.appendToFile(EOL, (fileWasSaved) => {
                if (fileWasSaved) {
                    this.displayRevertMessage();
                } else {
                    // todo
                }
            });

        }
    }

    private displayRevertMessage() {
        if (!this.shouldDisplayRevertMessage) {
            return;
        }
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
