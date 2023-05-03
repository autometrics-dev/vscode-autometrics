import * as vscode from "vscode";

// Make sure to keep this in sync with the
// "contributes.configuration.properties" section in the `package.json`.
export type AutometricsConfig = {
  experimentalChartsEnabled?: boolean;
  prometheusUrl?: string;
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

export function getChartsEnabled(config: AutometricsConfig): boolean {
  return config.experimentalChartsEnabled ?? false;
}

export function getPrometheusUrl(config: AutometricsConfig): string {
  return config.prometheusUrl || "http://localhost:9090/";
}
