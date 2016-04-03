import { window, commands, workspace, Disposable, ExtensionContext, Range, Position, TextEditor, TextDocument } from 'vscode';
import { EOL } from 'os';

export default class VSCodeAdapter {

    private editor;
    private doc;
    private alertFlag;

    private revertButtonLabel = 'Revert!';
    private stopThatButtonLabel = 'Stop that!';
    private revertMessageLabel = 'A blank line has been added at the end of your file!';

    public constructor() {
        this.init();
    }

    private init() {
        this.alertFlag = workspace.getConfiguration("blankLine").get('showMessage');
        this.doc = this.editor.document;
        this.editor = window.activeTextEditor;
    }

    public lastDocumentLineIsEmpty(): boolean {
        return this.lastTextLine() !== "";
    }

    private lastTextLine() {
        return this.doc.lineAt(this.doc.lineCount - 1).text;
    }

    public docLinesCount(): number {
        return this.doc.lineCount;
    }

    public docURI(): string {
        return this.doc.uri.toString();
    }

    public alertConfigValue(): boolean {
        return this.alertFlag !== {};
    }

    public addBlankLineAndSaveFile() {
        this.editor.edit(function(editbuilder) {
            editbuilder.insert(new Position(this.doc.lineCount, this.lastTextLine().length), EOL);
            setTimeout(function() {
                this.doc.save();
            }, 200);
        })
    }

    public displayRevertMessage(callback) {
        window
            .showInformationMessage(this.revertMessageLabel, this.revertButtonLabel, this.stopThatButtonLabel)
            .then(buttonPressedValue => {
                callback(buttonPressedValue === this.stopThatButtonLabel);
            });
    }

    public revert() {
        this.editor.edit(function(editbuilder) {
            // TODO: improve
            var lastLine = this.doc.lineCount - 1;
            var penultimateLine = this.doc.lineCount - 2;
            var secondlastLine = this.doc.lineAt(penultimateLine);
            var secondLastLineText = secondlastLine.text;
            var deleteRange = new Range(new Position(penultimateLine, secondLastLineText.length), new Position(lastLine, 1));

            editbuilder.delete(deleteRange);
            setTimeout(function() {
                this.doc.save();
            }, 200);
        });
    }

}
