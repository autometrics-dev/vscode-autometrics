// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getContent } from "./content";

function lineUnindented(text: string, indentation: string) {
  return text === "" || text.startsWith(indentation) === false;
}

function extractDecoratorName(
  text: string,
) {
  const decoratorRegex = /@(?<name>[\dA-z]+)/;
  const match = text.match(decoratorRegex);
  const name = match?.groups?.name;

  if (name) {
    return name;
  }
}

function hasAutometricsDecorator(
  document: vscode.TextDocument,
  line: number,
  indentation: string,
) {
  let currentLine = line;

  while (currentLine >= 0) {
    const text = document.lineAt(currentLine).text;
    if (lineUnindented(text, indentation)) {
      return false;
    }

    const decorator = extractDecoratorName(text);
    if (decorator === "autometrics") {
      return true;
    }

    currentLine -= 1;
  }
}

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);
  const functionRegex = /^(?<indentation>\s*)def\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  const name = match?.groups?.name;
  const indentation = match?.groups?.indentation ?? "";

  if (
    name
    && position.line > 1
    && hasAutometricsDecorator(document, position.line - 1, indentation)
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
