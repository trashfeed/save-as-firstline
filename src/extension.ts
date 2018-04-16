'use strict';
import * as vscode from 'vscode';
import FileHeadingSaver from './FileHeadingSaver';
import PathCompletionProvider from './PathCompletionProvider';

let builder: FileHeadingSaver;
let pathCompletion: PathCompletionProvider;
export function activate(context: vscode.ExtensionContext) {

    builder = new FileHeadingSaver("save.as.firstline");
    let commandSaveAsFirstline = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        builder.save();  
    });

    
    let commandPathCompletion = vscode.commands.registerCommand('extension.saveAsFirstline.ListPath', () => {
        pathCompletion = new PathCompletionProvider();
        vscode.languages.registerCompletionItemProvider('*', pathCompletion,...['/']);
    });    

    context.subscriptions.push(commandSaveAsFirstline);
    context.subscriptions.push(commandPathCompletion);

    pathCompletion = new PathCompletionProvider();
    vscode.languages.registerCompletionItemProvider('*', pathCompletion,...['/']);

}

export function deactivate() {
    if (builder) { 
        builder.dispose();
    }    
}

