import * as vscode from "vscode";

// Make sure to keep this in sync with the
// "contributes.configuration.properties" section in the `package.json`.
export type AutometricsConfig = {
  prometheusUrl?: string;
  experimentalRustSupport?: boolean;
  graphPreferences?: "embedded" | "prometheus";
};

const configSection = "autometrics";

export function affectsAutometricsConfig(
  event: vscode.ConfigurationChangeEvent,
): boolean {
  return event.affectsConfiguration(configSection);
}

export function getAutometricsConfig(): AutometricsConfig {
  return vscode.workspace.getConfiguration(configSection) as AutometricsConfig;
}

export function getPrometheusUrl(config: AutometricsConfig): string {
  return config.prometheusUrl || "http://localhost:9090/";
}
