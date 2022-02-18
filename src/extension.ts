import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');

function _headerTemplate(className: string) : string {
	return `#pragma once

class ${className} 
{
public:
	${className}();
	~${className}();
private:

};`;
}

function _srcTemplate(className: string, headerExt: string) : string {
	return `#include "${className}.${headerExt}"

${className}::${className}() 
{
}

${className}::~${className}() 
{
}`;
}

interface TemplateFile {
	outPath: string,
	fileTemplate: string
}

function _writeFiles(...templates: TemplateFile[]) {
	templates.forEach(template => {
		fs.writeFile(template.outPath, template.fileTemplate, err => {
			if (err) {
				vscode.window.showErrorMessage(`Unable to create the source file ${template.outPath}, because ${err?.message}`);
			} else {
				vscode.window.showInformationMessage(`File ${template.outPath} created successfully`);
			}
		});
	});
}

function _createDirectories(...paths: string[]) {
	paths.forEach(p => {
		vscode.window.showInformationMessage(p);
		if (!fs.existsSync(p)) {
			fs.mkdirSync(p, {recursive: true});
		}
	});
}


export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('cppclasscreator.main', () => {
		if(vscode.workspace.workspaceFolders !== undefined){
			const config = vscode.workspace.getConfiguration('cppclasscreator');
			const wf = vscode.workspace.workspaceFolders[0].uri.path;
			// get configuration on settings.json 
			const src = path.join(wf, config.get("sourceDir") || "src");
			const inc = path.join(wf, config.get("includeDir") || "inc");
			const srcExt = config.get("cppExt") as string || "cpp";
			const hExt = config.get("hExt") as string || "hpp";
			vscode.window.showInputBox({title: "Class Name", value: "MyClass"})
				.then(className => {
					if (className !== undefined && className !== "") {
						const validatedClassName = className.replace(/[^a-zA-Z0-9]/g, "");
						_createDirectories(src, inc);
						_writeFiles({
								outPath: path.join(src, `${validatedClassName}.${srcExt}`), 
								fileTemplate: _srcTemplate(validatedClassName, hExt)
							}, {
								outPath: path.join(inc, `${validatedClassName}.${hExt}`), 
								fileTemplate: _headerTemplate(validatedClassName)
							}
						);
					}
				});
		} else {
			const message = "CPP Class Creator: Working folder not found, open a folder an try again";
			vscode.window.showErrorMessage(message);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
