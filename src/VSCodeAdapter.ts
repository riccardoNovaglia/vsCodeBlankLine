import { window, commands, workspace, Disposable, ExtensionContext, Range, Position, TextDocument, TextEditor, TextLine } from 'vscode';

export default class VSCodeAdapter {

    private editor: TextEditor;
    private doc: TextDocument;
    private alertFlag: boolean;
    private removeExtraLines: boolean;
    private fileExtensionsToIgnore: Array<String>;

    private revertButtonLabel = 'Revert!';
    private notThisFileButtonLabel = 'Not this file!';
    private revertMessageLabel = 'A blank line has been added at the end of your file!';

    public constructor() {
        this.init();
    }

    private init() {
        this.alertFlag = workspace.getConfiguration("blankLine").get('showMessage');
        this.removeExtraLines = workspace.getConfiguration("blankLine").get('removeExtraLines');
        this.fileExtensionsToIgnore = workspace.getConfiguration("blankLine").get('fileExtensionsToIgnore');
        this.editor = window.activeTextEditor;
        this.doc = this.editor.document;
    }

    public textFromLineAt(linePosition): string {
        return this.lineAt(linePosition).text;
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

    public alertConfigValue(): boolean {
        return this.alertFlag;
    }

    public removeExtraLinesConfigValue(): boolean {
        return this.removeExtraLines;
    }

    public fileExtensionsToIgnoreConfigValue(): Array<String> {
        return this.fileExtensionsToIgnore;
    }

    public appendToFile(EOL, callback) {
        let adapter = this;
        this.editor.edit(function (editbuilder) {
            editbuilder.insert(adapter.endOfFilePosition(), EOL);
            adapter.saveFile(callback);
        })
    }

    public lastEmptyLinesCount(EOL): number {
        let text = this.doc.getText();
        const removeEOLPatter = `${EOL}+$`;

        return text.length - text.replace(new RegExp(removeEOLPatter), '').length;
    }

    public removeBlankLines(count, callback) {
        let adapter = this;
        this.editor.edit(function (editbuilder) {
            var deleteRange = adapter.lastLinesRange(count);
            editbuilder.delete(deleteRange);
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
                callback({ isClose: hitClose, isRevert: hitRevert, isNotThisFile: hitNotThisFile });
            });
    }

    public displayFileCouldNotBeSavedError() {
        window.showErrorMessage("Error: file could not be saved!");
    }

    public revert(EOL, lastOperation, callback) {
        let adapter = this;
        this.editor.edit(function (editbuilder) {
            const { type, count } = lastOperation;

            switch (type) {
                case "add":
                    var deleteRange = adapter.lastLinesRange(count);
                    editbuilder.delete(deleteRange);
                    break;
                case "remove":
                    editbuilder.insert(adapter.endOfFilePosition(), EOL.repeat(count));
                    break;
            }
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

    private lastLinesRange(count): Range {
        var lastFilledLineIndex = this.lastLineIndex() - count;
        var lastFilledLine = this.doc.lineAt(lastFilledLineIndex);
        var lastFilledLineText = lastFilledLine.text;
        var lastFilledLinePosition = new Position(lastFilledLineIndex, lastFilledLineText.length);

        return new Range(lastFilledLinePosition, this.endOfFilePosition());
    }
}
