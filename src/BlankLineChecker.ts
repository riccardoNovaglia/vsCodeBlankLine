import VSCodeAdapter from "./VSCodeAdapter";
import { EOL } from 'os'

export default class BlankLineChecker {

    private fileNameToBeExcluded = "";
    private revertButtonWasHit = false;

    private vsAdapter;

    public addBlankLineIfNeeded(vsAdapter: VSCodeAdapter): void {
        this.vsAdapter = vsAdapter;
        if (this.shouldNotSkipDoc()) {
            this.analyseDocContent();
        } else {
            if (this.revertButtonWasHit) {
                this.revertButtonWasHit = false;
            }
        }
    }

    private shouldNotSkipDoc() {
        return this.vsAdapter.docURI() !== this.fileNameToBeExcluded && !this.revertButtonWasHit;
    }

    private analyseDocContent() {
        if (this.shouldAddBlankLine()) {
            this.vsAdapter.appendToFile(EOL, (fileWasSaved) => {
                if (fileWasSaved) {
                    this.displayRevertMessage();
                } else {
                    this.vsAdapter.displayFileCouldNotBeSavedError();
                }
            });
        }
    }

    private shouldAddBlankLine() {
        return this.vsAdapter.docLineCount() > 0 && !this.vsAdapter.lastDocumentLineIsEmpty();
    }

    private displayRevertMessage() {
        if (!this.vsAdapter.alertConfigValue()) {
            return;
        }
        this.vsAdapter.displayRevertMessage(
            (userInput) => {
                if (!userInput.isClose) {
                    this.markDocumentToBeSkipped(userInput);
                    this.revertChange();
                }
            });
    }

    private markDocumentToBeSkipped(userInput) {
        if (userInput.isNotThisFile) {
            this.fileNameToBeExcluded = this.vsAdapter.docURI();
        } else if (userInput.isRevert) {
            this.revertButtonWasHit = true;
        }
    }

    private revertChange() {
        this.vsAdapter.revert((wasSaved) => {
            if (!wasSaved) {
                this.vsAdapter.displayFileCouldNotBeSavedError();
            }
        });
    }

    dispose() {
    }
}
