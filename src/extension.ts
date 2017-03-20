import {commands, workspace, Disposable, ExtensionContext} from "vscode";
import BlankLineChecker from "./BlankLineChecker";
import VSCodeAdapter from "./VSCodeAdapter";
import vscode = require('vscode');

export function activate(context: ExtensionContext) {

    let vsCodeAdapter = new VSCodeAdapter();
    let blankLineChecker = new BlankLineChecker();
    let controller = new BlankCheckerController(blankLineChecker, vsCodeAdapter);

    let disposable = commands.registerCommand('extension.checkBlankLine', () => {
        blankLineChecker.addBlankLineIfNeeded(vsCodeAdapter);
    });

    context.subscriptions.push(controller);
    context.subscriptions.push(disposable);
}

class BlankCheckerController {

    private blankChecker: BlankLineChecker;
    private vsCodeAdapter: VSCodeAdapter;

    constructor(blankChecker: BlankLineChecker, vsCodeAdapter: VSCodeAdapter) {
        this.blankChecker = blankChecker;
        this.vsCodeAdapter = vsCodeAdapter;

        let subscriptions: Disposable[] = [];
        workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);
    }

    dispose() {
    }

    private _onEvent() {
        this.blankChecker.addBlankLineIfNeeded(this.vsCodeAdapter);
    }
}
