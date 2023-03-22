// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getContent } from "./content";

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
export function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);

  const functionRegex = /def\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  const name = match?.groups?.name;
  const decoratorRegex = /@autometrics/g;

  if (
    name
    && position.line > 1
    && decoratorRegex.test(document.lineAt(position.line - 1).text)
  ) {
    return name;
  }
}

export const PythonHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return new vscode.Hover(getContent(name));
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  },
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate() {
  vscode.languages.registerHoverProvider("python", PythonHover);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
