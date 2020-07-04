// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { publishAll } from "./platform";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "publish-blog-ts" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "publish-blog-ts.publish",
    async function ({ fsPath }) {
      let { code, message } = await publishAll(fsPath);
      // The code you place here will be executed every time your command is executed
      if (code === 1) {
        vscode.window.showInformationMessage(message);
      } else {
        vscode.window.showErrorMessage(message);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
