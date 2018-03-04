'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const PathBuilder_1 = require("./PathBuilder");
let builder;
function activate(context) {
    builder = new PathBuilder_1.default("save.as.firstline");
    let disposable = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        builder.save();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
    if (builder) {
        builder.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map