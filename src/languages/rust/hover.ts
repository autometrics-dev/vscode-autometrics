import * as vscode from "vscode";

import { createFunctionHover } from "../../functionHover";

export const RustHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return createFunctionHover(name);
    }

    return undefined;
  },
};

// HACK: This is an incredibly naive hack that will just show a tooltip for
//       every function. We should replace this with a proper parsing solution.
//       See: https://github.com/autometrics-dev/vscode-autometrics/issues/29
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);
  const functionRegex = /fn\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  return match?.groups?.name;
}
