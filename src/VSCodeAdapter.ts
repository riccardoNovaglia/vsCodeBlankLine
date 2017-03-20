import {window, workspace, Range, Position, TextDocument, TextEditor, TextLine} from "vscode";

export default class VSCodeAdapter {

    private editor: TextEditor;
    private doc: TextDocument;
    private alertFlag: boolean;
    private fileTypesToExclude: Set<string>;

    private revertButtonLabel = 'Revert';
    private notThisFileButtonLabel = 'Exclude files with this type';
    private revertMessageLabel = 'A blank line has been added at the end of your file';

    public constructor() {
        this.alertFlag = workspace.getConfiguration("blankLine").get<boolean>('showMessage');
        this.fileTypesToExclude = new Set(workspace.getConfiguration("blankLine").get<Array<string>>('fileTypesToExclude', []));
        this.editor = window.activeTextEditor;
        this.doc = this.editor.document;
    }

    public lastDocumentLineIsEmpty(): boolean {
        return this.lineAt(this.lastLineIndex()).isEmptyOrWhitespace;
    }

    public docLineCount(): number {
        return this.doc.lineCount;
    }

    public docURI(): string {
        return this.doc.uri.toString();
    }

    public getAlertConfigValue(): boolean {
        return this.alertFlag;
    }

    public getFileTypesToExclude(): Set<string> {
        return this.fileTypesToExclude;
    }

    public appendToFile(EOL, callback) {
        let adapter = this;
        this.editor.edit(function (editbuilder) {
            editbuilder.insert(adapter.endOfFilePosition(), EOL);
            adapter.saveFile(callback);
        })
    }

    public displayRevertMessage(callback) {
        window
            .showInformationMessage(this.revertMessageLabel, this.revertButtonLabel, this.notThisFileButtonLabel)
            .then(buttonPressedValue => {
                let hitClose = buttonPressedValue === undefined;
                let hitRevert = buttonPressedValue === this.revertButtonLabel;
                let hitNotThisFile = buttonPressedValue === this.notThisFileButtonLabel;
                callback({isClose: hitClose, isRevert: hitRevert, isNotThisFile: hitNotThisFile});
            });
    }

    public displayFileCouldNotBeSavedError() {
        window.showErrorMessage("Error: file could not be saved!");
    }

    public revert(callback) {
        let adapter = this;
        this.editor.edit(function (editbuilder) {
            let deleteRange = adapter.lastLineRange();
            editbuilder.delete(deleteRange);
            adapter.saveFile(callback);
        });
    }

    private saveFile(callback) {
        // This timeout is a hack to ensure that the file edit is complete
        // before saving the file. Removing it would cause VSCode to not save the file after appending the blank line
        setTimeout(() => {
            if (this.doc.isDirty) {
                this.doc.save().then(
                    (wasSaved) => {
                        callback(wasSaved);
                    });
            } else {
                callback(true);
            }
        }, 100);
    }

    private lastTextLine(): string {
        return this.lineAt(this.lastLineIndex()).text;
    }

    private lineAt(index): TextLine {
        return this.doc.lineAt(index);
    }


    private endOfFilePosition(): Position {
        return new Position(this.doc.lineCount, this.lastTextLine().length);
    }

    private lastLineIndex(): number {
        return this.doc.lineCount - 1;
    }

    private lastLineRange(): Range {
        let penultimateLineIndex = this.lastLineIndex() - 1;
        let penultimateLineText = this.doc.lineAt(penultimateLineIndex).text;
        let penultimateLinePosition = new Position(penultimateLineIndex, penultimateLineText.length);

        return new Range(penultimateLinePosition, this.endOfFilePosition());
    }
}
