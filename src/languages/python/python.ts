import * as vscode from "vscode";

import { createFunctionHover } from "../../functionHover";
import { hasAutometricsDecorator } from "./decorator";

export function activatePythonSupport() {
  vscode.languages.registerHoverProvider("python", PythonHover);
}

export const PythonHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return createFunctionHover(name);
    }

    return undefined;
  },
};

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);
  // FIXME: We should replace this with a proper parsing solution.
  // - https://github.com/autometrics-dev/vscode-autometrics/issues/29
  const functionRegex =
    /^(?<indentation>\s*)(async\s*)?def\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  const name = match?.groups?.name;
  const indentation = match?.groups?.indentation ?? "";

  if (
    name &&
    position.line > 1 &&
    hasAutometricsDecorator(document, position.line - 1, indentation)
  ) {
    return name;
  }
}
