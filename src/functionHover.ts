import * as vscode from "vscode";

import { OPEN_PANEL_COMMAND } from "./constants";
import { PanelOptions } from "./chartPanel";
import {
  getAutometricsConfig,
  getExplorerUrl,
  getGraphPreferences,
  getPrometheusUrl,
} from "./config";
import {
  generateErrorRatioQuery,
  generateLatencyQuery,
  generateRequestRateQuery,
  getCalledByErrorRatio,
  getCalledByRequestRate,
} from "./queries";
import { makePrometheusUrl } from "./utils";

/**
 * Creates a VS Code hover for the given function.
 */
export function createFunctionHover(functionName: string): vscode.Hover {
  const graphPreference = getGraphPreferences(getAutometricsConfig());

  if (graphPreference === "embedded") {
    return createEmbeddedHover(functionName);
  }

  return createPrometheusHover(functionName);
}

function createEmbeddedHover(functionName: string): vscode.Hover {
  const content = `### Autometrics 
  [**View metrics**](${getOpenPanelCommand({
    type: "function_graphs",
    functionName,
  })})
  `;

  const markdown = new vscode.MarkdownString(content);
  markdown.isTrusted = true;

  return new vscode.Hover(markdown);
}

function createPrometheusHover(
  functionName: string,
  moduleName?: string,
): vscode.Hover {
  const config = getAutometricsConfig();
  const prometheusUrl =
    getGraphPreferences(config) === "explorer"
      ? getExplorerUrl(config)
      : getPrometheusUrl(config);
  const requestRateQuery = generateRequestRateQuery(functionName, moduleName);
  const errorRatioQuery = generateErrorRatioQuery(functionName, moduleName);
  const latencyQuery = generateLatencyQuery(functionName, moduleName);

  const calledByRequestQuery = getCalledByRequestRate(functionName);
  const calledByErrorRatioQuery = getCalledByErrorRatio(functionName);
  const requestRateUrl = makePrometheusUrl(requestRateQuery, prometheusUrl);
  const errorRatioUrl = makePrometheusUrl(errorRatioQuery, prometheusUrl);
  const latencyUrl = makePrometheusUrl(latencyQuery, prometheusUrl);

  const calleeRequestRateUrl = makePrometheusUrl(
    calledByRequestQuery,
    prometheusUrl,
  );
  const calleeErrorRatioUrl = makePrometheusUrl(
    calledByErrorRatioQuery,
    prometheusUrl,
  );

  const content = `### Autometrics
- [Request rate](${requestRateUrl})
- [Error ratio](${errorRatioUrl})
- [Latency (95th and 99th percentiles)](${latencyUrl})

Or, dig into the metrics of *functions called by* \`${functionName}\`
- [Request rate](${calleeRequestRateUrl})
- [Error ratio](${calleeErrorRatioUrl})
`;
  const markdown = new vscode.MarkdownString(content);
  markdown.isTrusted = true;

  return new vscode.Hover(markdown);
}

function getOpenPanelCommand(options: PanelOptions): string {
  return `command:${OPEN_PANEL_COMMAND}?${encodeURIComponent(
    JSON.stringify([options]),
  )}`;
}
