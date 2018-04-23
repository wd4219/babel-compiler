'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DealModel } from './DealModel';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('babel-compiler is now actived!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let dealModel = new DealModel();

    let disposablecompileAll =
        vscode.commands.registerCommand('babelCompiler.command.watchJS', () => {
            dealModel.compileAllFiles();
        });
    let disposablecompileAllOneTime =
        vscode.commands.registerCommand('babelCompiler.command.oneTimeCompileJS', () => {
            dealModel.compileAllFiles(false);
        });

    let disposableStopWaching =
        vscode.commands.registerCommand('babelCompiler.command.stopWatchJS', () => {
            dealModel.stopWatching();
        });
    let disposableOnDivSave =
        vscode.workspace.onDidSaveTextDocument(() => {
            dealModel.compileOnSave();
        });


    context.subscriptions.push(disposablecompileAll);
    context.subscriptions.push(disposableStopWaching);
    context.subscriptions.push(disposableOnDivSave);
    context.subscriptions.push(disposablecompileAllOneTime);
}

// this method is called when your extension is deactivated
export function deactivate() {
}