import * as vscode from "vscode";

import { createFunctionHover } from "../../functionHover";
import { getAutometricsConfig } from "../../config";

// TODO: See https://github.com/autometrics-dev/vscode-autometrics/issues/27
//       for tracking the Rust implementation.
export async function activateRustSupport(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async () => {
      await init(context);
    }),
  );

  await init(context);
}

let hoverProviderDisposable: vscode.Disposable | undefined;
let rustAnalyzerMonitorDisposable: vscode.Disposable | undefined;

/**
 * This function will enable/activate all rust related features
 */
async function activateExperimentalSupport(context: vscode.ExtensionContext) {
  if (!hoverProviderDisposable) {
    hoverProviderDisposable = vscode.languages.registerHoverProvider(
      "rust",
      RustHover,
    );
    context.subscriptions.push(hoverProviderDisposable);
  }

  if (isRustAnalyzerInstalled()) {
    // Next: disable the rust-analyzer docs by setting an environment variable.
    await updateAutometricsDocsSetting(context);
  } else {
    vscode.window.showErrorMessage(
      "Rust-analyzer extension is not installed or not active. Please install the extension and try again.",
    );

    if (!rustAnalyzerMonitorDisposable) {
      rustAnalyzerMonitorDisposable = vscode.extensions.onDidChange(() => {
        if (isRustAnalyzerInstalled()) {
          updateAutometricsDocsSetting(context);
        }
      });
  
      context.subscriptions.push(
        rustAnalyzerMonitorDisposable
      );
    }
  }
}

/**
 * This function removes all rust related features
 */
function cleanupExperimentalSupport(context: vscode.ExtensionContext) {
  if (hoverProviderDisposable) {
    hoverProviderDisposable.dispose();
    const index = context.subscriptions.indexOf(hoverProviderDisposable);
    if (index !== -1) {
      context.subscriptions.splice(index, 1);
    }
    hoverProviderDisposable = undefined;
  }

  if (rustAnalyzerMonitorDisposable) {
    rustAnalyzerMonitorDisposable.dispose();
    const index = context.subscriptions.indexOf(rustAnalyzerMonitorDisposable);
    if (index !== -1) {
      context.subscriptions.splice(index, 1);
    }
    rustAnalyzerMonitorDisposable = undefined;
  }
}

async function init(context: vscode.ExtensionContext) {
  const config = getAutometricsConfig();
  if (config.experimentalRustSupport) {
    await activateExperimentalSupport(context);
  } else {
    cleanupExperimentalSupport(context);
  }
}

function isRustAnalyzerInstalled() {
  const hasExtension = vscode.extensions.getExtension(
    "rust-lang.rust-analyzer",
  );

  return !!hasExtension;
}

async function updateAutometricsDocsSetting(context: vscode.ExtensionContext) {
  const rustAnalyzerConfig = vscode.workspace.getConfiguration("rust-analyzer");

  // But first, check if we've already done this before
  // and if so, don't set it again. People may have changed the config on purpose
  // and the extension should respect that.
  const rustConfigChecked = context.workspaceState.get("rustConfigChecked");
  if (rustConfigChecked === "true") {
    return;
  }

  const extraEnv = rustAnalyzerConfig.server?.extraEnv || {};
  if (extraEnv.AUTOMETRICS_DISABLE_DOCS !== "1") {
    // The extension will (temporarily) set the rust-analyzer to reload on config change
    const initialRestartValue = rustAnalyzerConfig.restartServerOnConfigChange;
    if (!initialRestartValue) {
      await rustAnalyzerConfig.update("restartServerOnConfigChange", true);
    }

    await rustAnalyzerConfig.update("server.extraEnv", {
      ...extraEnv,
      AUTOMETRICS_DISABLE_DOCS: "1",
    });

    // Restore the value if it was not originally set to true
    if (initialRestartValue !== true) {
      await rustAnalyzerConfig.update(
        "restartServerOnConfigChange",
        initialRestartValue,
      );
    }
  }

  context.workspaceState.update("rustConfigChecked", true);
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
