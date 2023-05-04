import * as vscode from "vscode";

import {
  affectsAutometricsConfig,
  getAutometricsConfig,
  getPrometheusUrl,
} from "../../config";

const typescriptExtensionId = "vscode.typescript-language-features";
const tsPluginId = "@autometrics/typescript-plugin";

export async function activateTypeScriptSupport() {
  const tsExtension = vscode.extensions.getExtension(typescriptExtensionId);
  if (!tsExtension) {
    return;
  }

  await tsExtension.activate();

  const tsExtensionApi = tsExtension.exports?.getAPI?.(0);
  if (!tsExtensionApi) {
    return;
  }

  // rome-ignore lint/suspicious/noExplicitAny: pluginAPI is not typed
  function configureTSPlugin(api: any) {
    const config = getAutometricsConfig();
    const prometheusUrl = getPrometheusUrl(config);
    console.log(`Configuring TS plugin with ${prometheusUrl}`);
    api.configurePlugin(tsPluginId, { prometheusUrl });
  }

  configureTSPlugin(tsExtensionApi);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (affectsAutometricsConfig(event)) {
      configureTSPlugin(tsExtensionApi);
    }
  });
}
