import * as vscode from "vscode";

type GraphPreference = "embedded" | "prometheus" | "explorer";

// Make sure to keep this in sync with the
// "contributes.configuration.properties" section in the `package.json`.
export type AutometricsConfig = {
  prometheusUrl?: string;
  experimentalRustSupport?: boolean;
  graphPreferences?: GraphPreference;
  webServerURL?: string;
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

export function getGraphPreferences(
  config: AutometricsConfig,
): GraphPreference {
  return config.graphPreferences || "embedded";
}

export function getPrometheusUrl(config: AutometricsConfig): string {
  return config.prometheusUrl || "http://localhost:9090/";
}

export function getExplorerUrl(config: AutometricsConfig): string {
  const baseUrl = config.webServerURL || "http://localhost:6789/";
  return `${baseUrl.replace(/\/$/, "")}`;
}
