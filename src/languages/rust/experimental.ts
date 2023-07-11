import * as vscode from "vscode";

import { RustHover } from "./hover";
import {
  getRustAnalyzerConfig,
  isRustAnalyzerInstalled,
  updateRustAnalyzerSettings,
} from "./rust-analyzer";

let hoverProviderDisposable: vscode.Disposable | undefined;
let rustAnalyzerMonitorDisposable: vscode.Disposable | undefined;

/**
 * This function will enable/activate all rust related features
 */
export async function activateExperimentalSupport(
  context: vscode.ExtensionContext,
) {
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

      context.subscriptions.push(rustAnalyzerMonitorDisposable);
    }
  }
}

/**
 * This function removes all rust related features
 */
export function cleanupExperimentalSupport(context: vscode.ExtensionContext) {
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

export function updateAutometricsDocsSetting(context: vscode.ExtensionContext) {
  const shouldUpdate = () => {
    const config = getRustAnalyzerConfig();
    const extraEnv = config.server?.extraEnv || {};
    return extraEnv.AUTOMETRICS_DISABLE_DOCS !== "1";
  };

  const updateSettings = async () => {
    const config = getRustAnalyzerConfig();
    const extraEnv = config.server?.extraEnv || {};
    await config.update("server.extraEnv", {
      ...extraEnv,
      AUTOMETRICS_DISABLE_DOCS: "1",
    });
  };

  return updateRustAnalyzerSettings(context, {
    checkKey: "rustConfigChecked",
    shouldUpdate,
    updateSettings,
  });
}
