import { window, commands, workspace, Disposable, ExtensionContext, Range, Position, TextDocument, TextEditor, TextLine } from 'vscode';

export default class VSCodeAdapter {

    private editor: TextEditor;
    private doc: TextDocument;
    private alertFlag;

    private revertButtonLabel = 'Revert!';
    private notThisFileButtonLabel = 'Not this file!';
    private revertMessageLabel = 'A blank line has been added at the end of your file!';

    public constructor() {
        this.init();
    }

    private init() {
        this.alertFlag = workspace.getConfiguration("blankLine").get('showMessage');
        this.editor = window.activeTextEditor;
        this.doc = this.editor.document;
    }

    public textFromLineAt(linePosition) {
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

    public appendToFile(EOL, callback) {
        let adapter = this;
        this.editor.edit(function(editbuilder) {
            editbuilder.insert(adapter.endOfFilePosition(), EOL);
            adapter.saveFile(callback);
        })
    }

    public displayRevertMessage(callback) {
        window
            .showInformationMessage(this.revertMessageLabel, this.revertButtonLabel, this.notThisFileButtonLabel)
            .then(buttonPressedValue => {
                hitClose = buttonPressedValue === undefined;
                hitRevert = buttonPressedValue === this.revertButtonLabel;
                hitNotThisFile = buttonPressedValue === this.notThisFileButtonLabel;
                callback({isClose: hitClose, isRevert: hitRevert, isNotThisFile: hitNotThisFile});
            });
    }

    public displayFileCouldNotBeSavedError() {
        window.showErrorMessage("Error: file could not be saved!");
    }

    public revert(callback) {
        let adapter = this;
        this.editor.edit(function(editbuilder) {
            var deleteRange = adapter.lastLineRange();
            editbuilder.delete(deleteRange);
            adapter.saveFile(callback);
        });
    }

    private saveFile(callback) {
        setTimeout(() => {
            this.doc.save().then(
                (wasSaved) => {
                    callback(wasSaved);
                });
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
        var penultimateLineIndex = this.lastLineIndex() - 1;
        var secondlastLine = this.doc.lineAt(penultimateLineIndex);
        var secondLastLineText = secondlastLine.text;
        var penultimateLinePosition = new Position(penultimateLineIndex, secondLastLineText.length);

        return new Range(penultimateLinePosition, this.endOfFilePosition());
    }
}
