'use strict';

import * as vscode from "vscode";
import fs = require("fs");
import path = require('path');
import mkdirp = require('mkdirp');

export default class FileHeadingSaver {

	private packageName: string = "";
	private config: vscode.WorkspaceConfiguration;
	private editor = vscode.window.activeTextEditor;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.config = vscode.workspace.getConfiguration(this.packageName);
	}

	public save(): void {

		let fullpath: string = this.buildPath();

		this.saveDocument(fullpath);

	}

	private findHeadingText(): string {

		let headingText: string = "";
		this.editor = vscode.window.activeTextEditor;
		if (!this.editor || !this.config) {
			return headingText;
		}

		// body
		let editorText: string = this.editor.document.getText().replace(/\r\n?/g, "\n");
		if (editorText.length < 1) {
			return headingText;
		}

		// heading
		let useMarkdownHeader: boolean = this.config.get('isMarkdownHeader', false);
		let lines: string[] = editorText.split("\n");
		for (var key in lines) {
			let line: string = lines[key];
			if (line.length < 1) {
				continue;
			}
			if (useMarkdownHeader) {
				let headLine: string = line.slice(0, 1);
				if (headLine !== "#") {
					continue;
				}
				let seek: number = line.indexOf(" ", 1);
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

	private saveFile() {
		vscode.commands.executeCommand("workbench.action.files.save");		
	}

	private saveDocument(fullPath: string): void {

		if (!this.editor) {
			return;
		}

		if (this.isExist(fullPath)) {
			this.saveFile();
		} else {
			this.saveAsFile(fullPath);
		}
	}

	private saveAsFile(fullPath:string){

		if (!this.editor) {
			return;
		}

		// create folder
		this.createFolder(fullPath);

		// open doc
		const uri = vscode.Uri.parse('untitled:' + fullPath);
		const position: vscode.Position = this.editor.selection.active;
		vscode.workspace.openTextDocument(uri).then((doc: vscode.TextDocument) => {

			// copy text
			const edit = new vscode.WorkspaceEdit();
			if (this.editor) {
				edit.insert(uri, new vscode.Position(0, 0), this.editor.document.getText());
			}
			
			// save as doc
			return vscode.workspace.applyEdit(edit).then(success => {
				if (success && this.editor) {
					if (this.editor.document.isUntitled) {
						vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor").then(() =>
							vscode.window.showTextDocument(doc).then(doc => {
								doc.selection = new vscode.Selection(position, position);
								vscode.commands.executeCommand("workbench.action.files.save");
							})
						);
					}
				}
			});
		});
	}

	private createFolder(fullPath: string): boolean {

		let dirName = this.getDirectoryName(fullPath);
		if (this.isExist(dirName)) {
			return true;
		}

		mkdirp(dirName, function (err) {
		});

		return true;
	}

	private getDirectoryName(fullPath: string): string {
		let dir = path.dirname(fullPath);
		return dir;
	}

	private isExist(path: string): boolean {
		if (fs.existsSync(path)) {
			return true;
		}
		return false;
	}

	private showAlert(msg: string): void {
		vscode.window.showErrorMessage(msg);
	}

	private buildPath(): string {

		let fullpath: string = "";
		if (!this.editor || this.editor.document.getText().length === 0) {
			return fullpath;
		}

		let rootPath = vscode.workspace.rootPath;
		if (!rootPath) {
			this.showAlert("please opened folder.");
			return fullpath;
		}

		let filename: string = this.buildFilename();
		if (filename.length === 0) {
			return fullpath;
		}

		let folderPath: string = this.buildFolderPath();
		if (filename.slice(0, 1) !== "/") {
			folderPath += "/";
		}

		fullpath = folderPath + filename;
		return fullpath;

	}

	private buildFolderPath(): string {

		let path = vscode.workspace.rootPath;
		if (path) {
			path = path.replace(/\\/g, "/");
		}
		return path + "";
	}

	private buildFilename(): string {

		let headingText: string = this.findHeadingText();
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
		let filename:string = headingText.replace("\\", "/");

		// full
		const extension: string = this.config.get('extension', ".md");
		filename = filename + extension;
		return filename;
	}

	public dispose(): void {

	}

}
