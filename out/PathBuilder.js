'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
class PathBuilder {
    constructor(packageName) {
        this.fullPath = "";
        this.packageName = "";
        this.headingText = "";
        this.editor = vscode.window.activeTextEditor;
        this.packageName = packageName;
        this.config = vscode.workspace.getConfiguration(this.packageName);
    }
    build() {
        this.editor = vscode.window.activeTextEditor;
        if (!this.editor || !this.config) {
            return;
        }
        this.clear();
        // body
        let editorText = this.editor.document.getText().replace(/\r\n?/g, "\n");
        if (editorText.length < 1) {
            return;
        }
        // heading
        let useMarkdownHeader = this.config.get('isMarkdownHeader', false);
        let lines = editorText.split("\n");
        for (var key in lines) {
            let line = lines[key];
            if (line.length < 1) {
                continue;
            }
            if (useMarkdownHeader) {
                let headLine = line.slice(0, 1);
                if (headLine !== "#") {
                    continue;
                }
                let seek = line.indexOf(" ", 1);
                if (seek < 1) {
                    continue;
                }
                line = line.substring(seek + 1, line.length);
            }
            this.headingText = line;
            break;
        }
        this.buildPath();
    }
    save() {
        this.build();
        if (this.fullPath.length < 1 || !this.editor) {
            return;
        }
        if (!this.isExist(this.fullPath)) {
            this.createFolder(this.fullPath);
        }
        else {
            vscode.commands.executeCommand("workbench.action.files.save");
            return;
        }
        const uri = vscode.Uri.parse('untitled:' + this.fullPath);
        const position = this.editor.selection.active;
        vscode.workspace.openTextDocument(uri).then((doc) => {
            const edit = new vscode.WorkspaceEdit();
            if (this.editor) {
                edit.insert(uri, new vscode.Position(0, 0), this.editor.document.getText());
            }
            return vscode.workspace.applyEdit(edit).then(success => {
                if (success && this.editor) {
                    if (this.editor.document.isUntitled) {
                        vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor").then(() => vscode.window.showTextDocument(doc).then(doc => {
                            doc.selection = new vscode.Selection(position, position);
                            vscode.commands.executeCommand("workbench.action.files.save");
                        }));
                    }
                }
            });
        });
    }
    createFolder(fullPath) {
        let dirName = this.getDirectoryName(fullPath);
        if (this.isExist(dirName)) {
            return true;
        }
        mkdirp(dirName, function (err) {
        });
        return true;
    }
    getDirectoryName(fullPath) {
        let dir = path.dirname(fullPath);
        return dir;
    }
    isExist(path) {
        if (fs.existsSync(path)) {
            return true;
        }
        return false;
    }
    buildPath() {
        if (!this.editor || this.editor.document.getText().length === 0) {
            return;
        }
        let rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            vscode.window.showErrorMessage("please opened folder.");
            return;
        }
        let filename = this.buildFilename();
        if (filename.length === 0) {
            return;
        }
        let folderPath = this.buildFolderPath();
        if (filename.slice(0, 1) !== "/") {
            folderPath += "/";
        }
        this.fullPath = folderPath + filename;
    }
    buildFolderPath() {
        let path = vscode.workspace.rootPath;
        if (path) {
            path = path.replace(/\\/g, "/");
        }
        return path + "";
    }
    buildFilename() {
        let filename = this.headingText;
        if (filename.length < 1) {
            return "";
        }
        // ignore
        let ignores = [":", "\\*", "\\?", "<", ">", "|", " ", "#"];
        for (var i = 0; i < ignores.length; i++) {
            let regExp = new RegExp(ignores[i], "g");
            filename = filename.replace(regExp, "");
        }
        if (filename.length < 1) {
            return "";
        }
        // dir
        filename = filename.replace("\\", "/");
        // full
        const extension = this.config.get('extension', ".md");
        filename = filename + extension;
        return filename;
    }
    clear() {
        this.headingText = "";
        this.fullPath = "";
    }
    dispose() {
        this.clear();
    }
}
exports.default = PathBuilder;
//# sourceMappingURL=PathBuilder.js.map