import * as vscode from "vscode";
import type { TimeRange } from "fiberplane-charts";

import { formatProviderError } from "./providerRuntime/errors";
import type { MessageFromWebview, MessageToWebview } from "./charts";
import { OPEN_PANEL_COMMAND } from "./constants";
import type { Prometheus } from "./prometheus";
import { createDefaultTimeRange, getNonce, getTitle } from "./utils";

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

export type TimeRangeOptions = {
  timeRange: TimeRange;
};

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
        console.log("sorry disposed");
        chartPanel = null;
      });
      chartPanel = panel;
    },
  );
}

function omit<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...target };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

function createChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
  options: PanelOptions,
): ChartPanel {
  let currentOptions: PanelOptions & TimeRangeOptions = {
    ...options,
    timeRange: createDefaultTimeRange(),
  };
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
    const timeRange = currentOptions?.timeRange || createDefaultTimeRange();
    currentOptions = { ...options, timeRange };
    panel.title = getTitle(options);
    postMessage({ type: "show_panel", options: currentOptions });
  }

  panel.webview.onDidReceiveMessage(
    (message: MessageFromWebview) => {
      switch (message.type) {
        case "ready":
          update(currentOptions);
          return;
        case "request_data": {
          const { query, timeRange, id } = message;
          prometheus
            .fetchTimeseries(query, timeRange)
            .then((data) => {
              postMessage({ type: "show_data", timeRange, data, id });
            })
            .catch((error: unknown) => {
              const errorMessage = formatProviderError(error);

              postMessage({
                type: "show_error",
                id,
                error: errorMessage,
              });

              if (options.type !== "function_graphs") {
                vscode.window.showErrorMessage(
                  `Could not query Prometheus. Query: ${query} Error: ${errorMessage}`,
                );
              }
            });
          return;
        }
        case "update_time_range": {
          const { timeRange } = message;
          currentOptions = { ...currentOptions, timeRange };
          return;
        }
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
