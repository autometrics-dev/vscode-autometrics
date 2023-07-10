import * as vscode from "vscode";

export function isRustAnalyzerInstalled() {
  const hasExtension = vscode.extensions.getExtension(
    "rust-lang.rust-analyzer",
  );

  return !!hasExtension;
}

export async function updateRustAnalyzerSettings(
  context: vscode.ExtensionContext,
  options: {
    checkKey: string; // The key to check if we've already set this setting
    shouldUpdate: () => boolean; // A function to check if we should update the setting
    updateSettings: () => Promise<void>; // A function to update the setting
  },
) {
  const { checkKey, shouldUpdate, updateSettings } = options;
  // But first, check if we've already done this before
  // and if so, don't set it again. People may have changed the config on purpose
  // and the extension should respect that.
  if (isWorkspaceKeySet(context, checkKey)) {
    return;
  }

  // shouldUpdate
  if (shouldUpdate()) {
    await withAnalyzerConfigRestart(updateSettings);
  }

  setWorkspaceStateKey(context, options.checkKey);
}

export function getRustAnalyzerConfig() {
  return vscode.workspace.getConfiguration("rust-analyzer");
}

export function isWorkspaceKeySet(
  context: vscode.ExtensionContext,
  key: string,
) {
  return context.workspaceState.get(key) === true;
}

export function setWorkspaceStateKey(
  context: vscode.ExtensionContext,
  key: string,
) {
  return context.workspaceState.update(key, true);
}

export function resetWorkspaceStateKey(
  context: vscode.ExtensionContext,
  key: string,
) {
  return context.workspaceState.update(key, undefined);
}

// This configures the rust-analyzer to restart on config change and after the updater is done, reverts that change
export async function withAnalyzerConfigRestart(updater: () => Promise<void>) {
  const config = getRustAnalyzerConfig();

  const initialRestartValue = config.restartServerOnConfigChange;
  if (!initialRestartValue) {
    // The extension will (temporarily) set the rust-analyzer to restart on config change
    await config.update("restartServerOnConfigChange", true);
  }

  await updater();

  // Restore the value if it was not originally set to true
  if (initialRestartValue !== true) {
    await config.update("restartServerOnConfigChange", initialRestartValue);
  }
}
