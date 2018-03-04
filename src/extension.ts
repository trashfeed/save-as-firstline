'use strict';
import * as vscode from 'vscode';
import PathBuilder from './PathBuilder';

let builder:PathBuilder;
export function activate(context: vscode.ExtensionContext) {
    builder = new PathBuilder("save.as.firstline");
    let disposable = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        builder.save();
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (builder) {
        builder.dispose();
    }    
}

