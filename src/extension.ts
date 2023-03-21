// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getContent } from "./content";

// let config;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {
export function activate() {
  vscode.languages.registerHoverProvider("python", {
    provideHover(document, position) {
      const textLine = document.lineAt(position.line);

      // TODO: (JF) we should also display the tooltip when
      //
      const functionRegex = /def\s*(?<name>[\dA-z]+)?\s*\(/;
      const match = textLine.text.match(functionRegex);
      const name = match?.groups?.name;
      const decoratorRegex = /@autometrics/g;
      if (
        name &&
        position.line > 1 &&
        decoratorRegex.test(document.lineAt(position.line - 1).text)
      ) {
        return new vscode.Hover(getContent(name));
      }

      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    },
  });
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
