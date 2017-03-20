import VSCodeAdapter from "./VSCodeAdapter";
import {EOL} from "os";

export default class BlankLineChecker {

    private filesExtensionsToIgnore: Set<String>;
    private revertButtonWasHit = false;

    private vsAdapter: VSCodeAdapter;

    public addBlankLineIfNeeded(vsAdapter: VSCodeAdapter): void {
        this.vsAdapter = vsAdapter;
        this.filesExtensionsToIgnore = vsAdapter.getFileTypesToExclude();
        if (this.shouldNotSkipDoc()) {
            this.analyseDocContent();
        } else {
            if (this.revertButtonWasHit) {
                this.revertButtonWasHit = false;
            }
        }
    }

    private shouldNotSkipDoc() {
        return this.fileExtensionIsNotExcluded() && !this.revertButtonWasHit;
    }

    private fileExtensionIsNotExcluded() {
        return !this.filesExtensionsToIgnore.has(this.getFileExtension(this.vsAdapter.docURI()));
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
        if (!this.vsAdapter.getAlertConfigValue()) {
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
            this.filesExtensionsToIgnore.add(this.getFileExtension(this.vsAdapter.docURI()))
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

    private getFileExtension(filePath: String) {
        let lastDot = filePath.lastIndexOf(".");
        return lastDot != -1 ? filePath.substr(lastDot) : filePath;
    }

    dispose() {
    }
}
