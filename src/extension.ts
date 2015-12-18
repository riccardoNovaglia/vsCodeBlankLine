// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import { window, commands, workspace, MessageItem, Disposable, ExtensionContext, Range, Position, Location } from 'vscode';
import { EOL } from 'os';
import vscode = require('vscode');


// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    // console.log('Congratulations, your extension "BlankLineChecker" is now active!');

    // reate a new object which will verify that the last line is blank, and will add one if neededCcreate a new object which will verify that the last line is blank, and will add one if needed
    let blankLineChecker = new BlankLineChecker();
    // controller
    let controller = new BlankCheckerController(blankLineChecker);

    var disposable = commands.registerCommand('extension.checkBlankLine', () => {
        blankLineChecker.addBlankLineIfNeeded();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(blankLineChecker);
    context.subscriptions.push(disposable);
}

class BlankLineChecker {

    private stopThat = "";
    private skipOne = false;

    public addBlankLineIfNeeded() {
        // Get the current text editor
        let editor = window.activeTextEditor;
        let checker = this;
        let doc = editor.document;
        if (doc.uri.toString() != this.stopThat && !this.skipOne) {
            var lastLine = doc.lineAt(doc.lineCount - 1);
            var lastLineText = lastLine.text
            if (doc.lineCount > 1 && lastLineText !== '') {
                editor.edit(function(editbuilder) {
                    editbuilder.insert(new Position(doc.lineCount, lastLineText.length), EOL);
                    setTimeout(function() {
                        doc.save();
                    }, 200);
                    let alertFlag = workspace.getConfiguration("blankLine").get('showMessage');
                    if (alertFlag) {
                        var revertButton = 'Revert!';
                        var stopThat = 'Stop that!';
                        window.showInformationMessage('A blank line has been added at the end of your file!', revertButton, stopThat).then(value => {
                            if (value === revertButton) {
                                checker.revert(editor, checker, false);
                            } else if (value === stopThat) {
                                checker.revert(editor, checker, true);
                            }
                        });
                    }
                })
            }
        } else {
            if (this.skipOne) {
                this.skipOne = false;
            }
        }
    }

    private revert(editor: vscode.TextEditor, checker: BlankLineChecker, stopIt) {
        let doc = editor.document;
        editor.edit(function(editbuilder) {
            var lastLine = doc.lineCount - 1;
            var penultimateLine = doc.lineCount - 2;
            var secondlastLine = doc.lineAt(penultimateLine);
            var secondLastLineText = secondlastLine.text;
            var deleteRange = new Range(new Position(penultimateLine, secondLastLineText.length), new Position(lastLine, 1));

            editbuilder.delete(deleteRange);
            setTimeout(function() {
                doc.save();
            }, 200);
            if (stopIt) {
                checker.stopThat = doc.uri.toString();
            } else {
                checker.skipOne = true;
            }
        });
    }

    dispose() {

    }
}

class BlankCheckerController {

    private blankChecker: BlankLineChecker;

    constructor(blankChecker: BlankLineChecker) {
        this.blankChecker = blankChecker;

        // subscribe to trigger when the file is saved
        let subscriptions: Disposable[] = [];
        workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);

        // create a combined disposable from both event subscriptions
    }

    dispose() {

    }

    private _onEvent() {
        this.blankChecker.addBlankLineIfNeeded();
    }
}
