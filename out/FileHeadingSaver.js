'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
class FileHeadingSaver {
    constructor(packageName) {
        this.packageName = "";
        this.editor = vscode.window.activeTextEditor;
        this.packageName = packageName;
        this.config = vscode.workspace.getConfiguration(this.packageName);
    }
    save() {
        let fullpath = this.buildPath();
        this.saveDocument(fullpath);
    }
    findHeadingText() {
        let headingText = "";
        this.editor = vscode.window.activeTextEditor;
        if (!this.editor || !this.config) {
            return headingText;
        }
        // body
        let editorText = this.editor.document.getText().replace(/\r\n?/g, "\n");
        if (editorText.length < 1) {
            return headingText;
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
            headingText = line;
            break;
        }
        return headingText;
    }
    saveFile() {
        vscode.commands.executeCommand("workbench.action.files.save");
    }
    saveDocument(fullPath) {
        if (!this.editor) {
            return;
        }
        if (this.isExist(fullPath)) {
            this.saveFile();
        }
        else {
            this.saveAsFile(fullPath);
        }
    }
    saveAsFile(fullPath) {
        if (!this.editor) {
            return;
        }
        // create folder
        this.createFolder(fullPath);
        // open doc
        const uri = vscode.Uri.parse('untitled:' + fullPath);
        const position = this.editor.selection.active;
        vscode.workspace.openTextDocument(uri).then((doc) => {
            // copy text
            const edit = new vscode.WorkspaceEdit();
            if (this.editor) {
                edit.insert(uri, new vscode.Position(0, 0), this.editor.document.getText());
            }
            // save as doc
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
    showAlert(msg) {
        vscode.window.showErrorMessage(msg);
    }
    buildPath() {
        let fullpath = "";
        if (!this.editor || this.editor.document.getText().length === 0) {
            return fullpath;
        }
        let rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            this.showAlert("please opened folder.");
            return fullpath;
        }
        let filename = this.buildFilename();
        if (filename.length === 0) {
            return fullpath;
        }
        let folderPath = this.buildFolderPath();
        if (filename.slice(0, 1) !== "/") {
            folderPath += "/";
        }
        fullpath = folderPath + filename;
        return fullpath;
    }
    buildFolderPath() {
        let path = vscode.workspace.rootPath;
        if (path) {
            path = path.replace(/\\/g, "/");
        }
        return path + "";
    }
    buildFilename() {
        let headingText = this.findHeadingText();
        if (headingText.length < 1) {
            return "";
        }
        // ignore
        let ignores = [":", "\\*", "\\?", "<", ">", "|", " ", "#"];
        for (var i = 0; i < ignores.length; i++) {
            let regExp = new RegExp(ignores[i], "g");
            headingText = headingText.replace(regExp, "");
        }
        if (headingText.length < 1) {
            return "";
        }
        // dir
        let filename = headingText.replace("\\", "/");
        // full
        const extension = this.config.get('extension', ".md");
        filename = filename + extension;
        return filename;
    }
    dispose() {
    }
}
exports.default = FileHeadingSaver;
//# sourceMappingURL=FileHeadingSaver.js.map