import * as vscode from "vscode";

import { createFunctionHover } from "../../functionHover";

// TODO: See https://github.com/autometrics-dev/vscode-autometrics/issues/27
//       for tracking the Rust implementation.
export function activateRustSupport() {
  const rustAnalyzerConfig = vscode.workspace.getConfiguration("rust-analyzer");
  if (rustAnalyzerConfig.server?.extraEnv?.AUTOMETRICS_DOCS_GEN !== "0") {
    // Note: Name of the environment variable may still change.
    // See: https://github.com/autometrics-dev/autometrics-rs/issues/80
    rustAnalyzerConfig.update("server.extraEnv.AUTOMETRICS_DOCS_GEN", "0");
  }

  vscode.languages.registerHoverProvider("rust", RustHover);
}

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
