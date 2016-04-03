import { window, commands, workspace, Disposable, ExtensionContext, Range, Position } from 'vscode';
import { EOL } from 'os';
import vscode = require('vscode');
import BlankLineChecker from './BlankLineChecker';

export function activate(context: ExtensionContext) {

    let blankLineChecker = new BlankLineChecker();
    let controller = new BlankCheckerController(blankLineChecker);

    var disposable = commands.registerCommand('extension.checkBlankLine', () => {
        blankLineChecker.addBlankLineIfNeeded();
    });

    context.subscriptions.push(controller);
    context.subscriptions.push(blankLineChecker);
    context.subscriptions.push(disposable);
}

class BlankCheckerController {

    private blankChecker: BlankLineChecker;

    constructor(blankChecker: BlankLineChecker) {
        this.blankChecker = blankChecker;

        let subscriptions: Disposable[] = [];
        workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);
    }

    dispose() {
    }

    private _onEvent() {
        this.blankChecker.addBlankLineIfNeeded();
    }
}
