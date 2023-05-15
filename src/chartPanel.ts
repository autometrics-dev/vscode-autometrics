import * as vscode from "vscode";

import { affectsAutometricsConfig, getAutometricsConfig } from "./config";
import { formatProviderError } from "./providerRuntime/errors";
import type { MessageFromWebview, MessageToWebview } from "./charts";
import { OPEN_PANEL_COMMAND } from "./constants";
import type { Prometheus } from "./prometheus";
import { getNonce } from "./utils";

/**
 * Options for the kind of chart to display.
 */

export type SingleChartOptions =
  | { type: "function"; functionName: string; moduleName?: string }
  | { type: "called_by"; functionName: string; moduleName?: string }
  | { type: "metric"; metricName: string };

export type PanelOptions =
  | SingleChartOptions
  | { type: "function_graphs"; functionName: string; moduleName?: string };

type ChartPanel = {
  /**
   * Reveals the panel.
   */
  reveal(): void;

  /**
   * Instructs the panel to display a new metric.
   */
  update(options: PanelOptions): void;

  onDidDispose: vscode.WebviewPanel["onDidDispose"];
};

export function registerChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
) {
  let chartPanel: ChartPanel | null = null;
  let config = getAutometricsConfig();

  vscode.commands.registerCommand(
    OPEN_PANEL_COMMAND,
    (options: PanelOptions) => {
      // Reuse existing panel if available.
      if (chartPanel) {
        chartPanel.update(options);
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
  options: PanelOptions,
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

  function update(options: PanelOptions) {
    panel.title = getTitle(options);
    postMessage({ type: "show_panel", options });
  }

  panel.webview.onDidReceiveMessage(
    (message: MessageFromWebview) => {
      switch (message.type) {
        case "ready":
          update(options);
          return;
        case "request_data":
          const { query, timeRange, id } = message;
          prometheus
            .fetchTimeseries(query, timeRange)
            .then((data) => {
              // console.log("calling show_data", { query, data, id, timeRange });
              postMessage({ type: "show_data", timeRange, data, id });
            })
            .catch((error: unknown) => {
              const errorMessage = formatProviderError(error);

              postMessage({
                type: "show_error",
                id,
                error: errorMessage,
              });
              vscode.window.showErrorMessage(
                `Could not query Prometheus. Query: ${query} Error: ${errorMessage}`,
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
    update,
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
    vscode.Uri.joinPath(distUri, "styles", "vscode.css"),
  );

  // Use a nonce to only allow a specific script to be run.
  const nonce = getNonce();

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
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

export function getTitle(options: PanelOptions) {
  switch (options.type) {
    case "called_by":
      return `Called by ${options.functionName}`;
    case "function":
      return options.functionName;
    case "metric":
      return options.metricName;
    case "function_graphs":
      return options.functionName;
  }
}
