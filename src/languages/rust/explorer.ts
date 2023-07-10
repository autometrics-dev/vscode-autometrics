import * as vscode from "vscode";
import { getAutometricsConfig, getExplorerUrl } from "../../config";
import {
  getRustAnalyzerConfig,
  resetWorkspaceStateKey,
  updateRustAnalyzerSettings,
  withAnalyzerConfigRestart,
} from "./rust-analyzer";

const EXPLORER_KEY = "explorer";

function usesExplorerUrl() {
  const prometheusUrl = getExplorerUrl(getAutometricsConfig());
  const config = getRustAnalyzerConfig();
  const extraEnv = config.server?.extraEnv || {};
  return extraEnv.PROMETHEUS_URL === prometheusUrl;
}

async function updateSettings() {
  const prometheusUrl = getExplorerUrl(getAutometricsConfig());
  const config = getRustAnalyzerConfig();
  const extraEnv = config.server?.extraEnv || {};
  await config.update("server.extraEnv", {
    ...extraEnv,
    PROMETHEUS_URL: prometheusUrl,
  });
}

export function activateExplorer(context: vscode.ExtensionContext) {
  return updateRustAnalyzerSettings(context, {
    checkKey: EXPLORER_KEY,
    shouldUpdate: () => usesExplorerUrl() === false,
    updateSettings,
  });
}

export async function deactivateExplorer(context: vscode.ExtensionContext) {
  if (usesExplorerUrl() === false) {
    await withAnalyzerConfigRestart(async () => {
      const config = getRustAnalyzerConfig();
      const { PROMETHEUS_URL: _, ...extraEnv } = config.server?.extraEnv || {};
      await config.update("server.extraEnv", {
        ...extraEnv,
      });
    });
  }

  await resetWorkspaceStateKey(context, EXPLORER_KEY);
}
