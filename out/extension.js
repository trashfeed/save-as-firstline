'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const FileHeadingSaver_1 = require("./FileHeadingSaver");
const PathCompletionProvider_1 = require("./PathCompletionProvider");
let builder;
let pathCompletion;
function activate(context) {
    builder = new FileHeadingSaver_1.default("save.as.firstline");
    let commandSaveAsFirstline = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        builder.save();
    });
    let commandPathCompletion = vscode.commands.registerCommand('extension.saveAsFirstline.ListPath', () => {
        pathCompletion = new PathCompletionProvider_1.default();
        vscode.languages.registerCompletionItemProvider('*', pathCompletion, ...['/']);
    });
    context.subscriptions.push(commandSaveAsFirstline);
    context.subscriptions.push(commandPathCompletion);
    pathCompletion = new PathCompletionProvider_1.default();
    vscode.languages.registerCompletionItemProvider('*', pathCompletion, ...['/']);
}
exports.activate = activate;
function deactivate() {
    if (builder) {
        builder.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map