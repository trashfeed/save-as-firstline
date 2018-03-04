'use strict';
import * as vscode from 'vscode';
import PathBuilder from './PathBuilder';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        save(context);
    });
    context.subscriptions.push(disposable);
}

function save(ontext: vscode.ExtensionContext) {
    let builder: PathBuilder = new PathBuilder("save.as.firstline");
	builder.save();
}
