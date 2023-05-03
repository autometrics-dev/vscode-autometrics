import * as vscode from "vscode";

import {
  AutometricsConfig,
  affectsAutometricsConfig,
  getAutometricsConfig,
  getChartsEnabled,
  getPrometheusUrl,
} from "./config";
import { formatProviderError } from "./providerRuntime/errors";
import { getCalledByRequestRate, getRequestRate, getSumQuery } from "./queries";
import type { MessageFromWebview, MessageToWebview } from "./charts";
import { OPEN_CHART_COMMAND } from "./constants";
import type { Prometheus } from "./prometheus";

/**
 * Options for the kind of chart to display.
 */
export type ChartOptions =
  | { type: "function"; functionName: string; moduleName?: string }
  | { type: "called_by"; functionName: string; moduleName?: string }
  | { type: "metric"; metricName: string };

type ChartPanel = {
  /**
   * Reveals the panel.
   */
  reveal(): void;

  /**
   * Instructs the panel to display a new metric.
   */
  showChart(chart: ChartOptions): void;

  onDidDispose: vscode.WebviewPanel["onDidDispose"];
};

export function registerChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
) {
  let chartPanel: ChartPanel | null = null;
  let config = getAutometricsConfig();

  vscode.commands.registerCommand(
    OPEN_CHART_COMMAND,
    (options: ChartOptions) => {
      // Redirect to Prometheus if charts are disabled.
      if (!getChartsEnabled(config)) {
        let query;
        switch (options.type) {
          case "called_by":
            query = getCalledByRequestRate(options.functionName);
            break;
          case "function":
            query = getRequestRate(options.functionName);
            break;
          case "metric":
            query = getSumQuery(options.metricName);
            break;
        }

        vscode.env.openExternal(getExternalPrometheusGraphUrl(config, query));
        return;
      }

      // Reuse existing panel if available.
      if (chartPanel) {
        chartPanel.showChart(options);
        chartPanel.reveal();
        return;
      }

      const panel = createChartPanel(context, prometheus, options);
      panel.onDidDispose(() => {
        chartPanel = null;
      });
      chartPanel = panel;
    },
  );

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (affectsAutometricsConfig(event)) {
      config = getAutometricsConfig();
    }
  });
}

function createChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
  options: ChartOptions,
): ChartPanel {
  const panel = vscode.window.createWebviewPanel(
    "autometricsChart",
    getTitle(options),
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  function postMessage(message: MessageToWebview) {
    panel.webview.postMessage(message);
  }

  function showChart(options: ChartOptions) {
    panel.title = getTitle(options);
    postMessage({ type: "show_chart", options });
  }

  panel.webview.onDidReceiveMessage(
    (message: MessageFromWebview) => {
      switch (message.type) {
        case "ready":
          showChart(options);
          return;
        case "request_data":
          const { query, timeRange } = message;
          prometheus
            .fetchTimeseries(query, timeRange)
            .then((data) => {
              postMessage({ type: "show_data", timeRange, data });
            })
            .catch((error: unknown) => {
              vscode.window.showErrorMessage(
                `Could not query Prometheus. Query: ${query} Error: ${formatProviderError(
                  error,
                )}`,
              );
            });
          return;
      }
    },
    undefined,
    context.subscriptions,
  );

  panel.webview.html = getHtmlForWebview(context, panel.webview);

  return {
    reveal: panel.reveal.bind(panel),
    showChart,
    onDidDispose: panel.onDidDispose.bind(panel),
  };
}

function getHtmlForWebview(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
) {
  // Get the local path to main script run in the webview, then convert it to a
  // URI we can use in the webview.
  const distUri = vscode.Uri.joinPath(context.extensionUri, "dist");
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(distUri, "chart.js"),
  );

  // Do the same for the stylesheet.
  const styleVSCodeUri = webview.asWebviewUri(
    vscode.Uri.joinPath(distUri, "vscode.css"),
  );

  // Use a nonce to only allow a specific script to be run.
  const nonce = getNonce();

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <title>Autometrics Chart</title>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
    </body>
    </html>`;
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getExternalPrometheusGraphUrl(
  config: AutometricsConfig,
  query: string,
): vscode.Uri {
  const parameters = new URLSearchParams();
  parameters.set("g0.expr", query);
  parameters.set("g0.tab", "0");
  return vscode.Uri.parse(
    `${getPrometheusUrl(config)}/graph?${parameters.toString()}`,
  );
}

export function getTitle(options: ChartOptions) {
  switch (options.type) {
    case "called_by":
      return `Called by ${options.functionName}`;
    case "function":
      return options.functionName;
    case "metric":
      return options.metricName;
  }
}
