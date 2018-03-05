'use strict';

import * as vscode from "vscode";
import fs = require("fs");

export default class PathBuilder {

	public path: string = "";
	private packageName: string = "";
	private headingText: string = "";
	private config: vscode.WorkspaceConfiguration;
	private editor = vscode.window.activeTextEditor;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.config = vscode.workspace.getConfiguration(this.packageName);

	}

	private build(): void {

		this.editor = vscode.window.activeTextEditor;
		if (!this.editor || !this.config) {
			return;
		}

		this.clear();

		// body
		let editorText: string = this.editor.document.getText().replace(/\r\n?/g, "\n");
		if (editorText.length < 1) {
			return;
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
			this.headingText = line;
			break;
		}

		this.buildPath();
	}

	public save(): void {

		this.build();

		if (this.path.length < 1 || !this.editor) {
			return;
		}

		if (!this.isExist(this.path)) {
			this.createFolder(this.path);
		} else {
			vscode.commands.executeCommand("workbench.action.files.save");
			return;
		}

		const uri = vscode.Uri.parse('untitled:' + this.path);
		const position: vscode.Position = this.editor.selection.active;

		vscode.workspace.openTextDocument(uri).then((doc: vscode.TextDocument) => {
			const edit = new vscode.WorkspaceEdit();
			if (this.editor) {
				edit.insert(uri, new vscode.Position(0, 0), this.editor.document.getText());

			}
			return vscode.workspace.applyEdit(edit).then(success => {
				if (success && this.editor) {

					if (this.editor.document.isUntitled) {
						vscode.commands.executeCommand("workbench.action.files.revert");
					} 
					
					vscode.window.showTextDocument(doc).then(doc => {
						doc.selection = new vscode.Selection(position, position);
						vscode.commands.executeCommand("workbench.action.files.save");
					});
				}
			});
		});
	}

	private createFolder(fullPath: string): boolean {
		let dirName = this.getDirectoryName(fullPath);
		if (this.isExist(dirName)) {
			return true;
		}

		let mkdirp = require('mkdirp');
		mkdirp(dirName);
		return true;
	}

	private getDirectoryName(fullPath: string): string {
		let path = require('path');
		let dir = path.dirname(fullPath);
		return dir;
	}

	private isExist(path: string): boolean {
		if (fs.existsSync(path)) {
			return true;
		}
		return false;
	}

	private buildPath(): void {

		if (!this.editor || this.editor.document.getText().length === 0) {
			return;
		}
		let path = vscode.workspace.rootPath;
		if (!path) {
			vscode.window.showErrorMessage("please opened folder.");
			return;
		}

		let filename: string = this.buildFilename();
		if (filename.length === 0) {
			return;
		}
		let folderPath: string = this.buildFolderPath();
		if (filename.slice(0, 1) !== "/") {
			folderPath += "/";
		}
		this.path = folderPath + filename;

	}

	private buildFolderPath(): string {
 
		let path = vscode.workspace.rootPath;
		if (path) {
			path = path.replace(/\\/g, "/");
		}
		return path + "";
	}

	private buildFilename(): string {

		let filename: string = this.headingText;
		if (filename.length < 1) {
			return "";
		}

		// ignore
		let ignores = [":", "\\*", "\\?", "<", ">", "|", " ","#"];
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
		const extension: string = this.config.get('extension', ".md");
		filename = filename + extension;
		return filename;
	}

	private clear(): void {
		this.headingText = "";
		this.path = "";
	}

	public dispose(): void {
		this.clear();
	}

}
