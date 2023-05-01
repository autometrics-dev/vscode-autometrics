import * as vscode from "vscode";

import type { MessageFromWebview, MessageToWebview } from "./charts";
import type { Prometheus } from "./prometheus";

export type ChartPanel = {
  /**
   * Reveals the panel.
   */
  reveal(): void;

  /**
   * Instructs the panel to display a new metric.
   */
  showMetric(metric: string, labels?: Record<string, string>): void;

  onDidDispose: vscode.WebviewPanel["onDidDispose"];
};

export function createChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
  metric: string,
  labels: Record<string, string> = {},
): ChartPanel {
  const panel = vscode.window.createWebviewPanel(
    "autometricsChart",
    metric,
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  function postMessage(message: MessageToWebview) {
    panel.webview.postMessage(message);
  }

  function showMetric(metric: string, labels: Record<string, string> = {}) {
    postMessage({ type: "show_metrics", metric, labels });
  }

  panel.webview.onDidReceiveMessage(
    (message: MessageFromWebview) => {
      switch (message.type) {
        case "ready":
          showMetric(metric, labels);
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
                `Could not query Prometheus. Query: ${query} Error: ${
                  error && typeof error === "object" && "message" in error
                    ? error.message
                    : error?.toString()
                }`,
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
    showMetric,
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
