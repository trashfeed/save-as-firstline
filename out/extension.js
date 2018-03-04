'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const PathBuilder_1 = require("./PathBuilder");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.saveAsFirstline', () => {
        save(context);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function save(ontext) {
    let builder = new PathBuilder_1.default("save.as.firstline");
    builder.save();
}
//# sourceMappingURL=extension.js.map