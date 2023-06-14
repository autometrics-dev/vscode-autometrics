import * as vscode from "vscode";

import { formatProviderError } from "./providerRuntime/errors";
import type { MessageFromWebview, MessageToWebview } from "./charts";
import { OPEN_PANEL_COMMAND } from "./constants";
import type { Prometheus } from "./prometheus";
import {
  createDefaultTimeRange,
  getNonce,
  getTitle,
  relativeToAbsoluteTimeRange,
} from "./utils";
import { FlexibleTimeRange } from "./types";

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

export type GlobalGraphSettings = {
  timeRange: FlexibleTimeRange;
  showingQuery: boolean;
};

type ChartPanel = {
  /**
   * Reveals the panel.
   */
  reveal(): void;

  /**
   * Instructs the panel to display a new metric.
   */
  update(options: PanelOptions): Promise<void>;

  onDidDispose: vscode.WebviewPanel["onDidDispose"];
};

export function registerChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
) {
  let chartPanel: ChartPanel | null = null;

  vscode.commands.registerCommand(
    OPEN_PANEL_COMMAND,
    async (options: PanelOptions) => {
      // Reuse existing panel if available.
      if (chartPanel) {
        await chartPanel.update(options);
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
}

function createChartPanel(
  context: vscode.ExtensionContext,
  prometheus: Prometheus,
  options: PanelOptions,
): ChartPanel {
  let currentOptions: PanelOptions & GlobalGraphSettings = {
    ...options,
    timeRange: createDefaultTimeRange(),
    showingQuery: false,
  };
  const panel = vscode.window.createWebviewPanel(
    "autometricsChart",
    getTitle(options),
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  async function postMessage(message: MessageToWebview) {
    await panel.webview.postMessage(message);
  }

  async function update(options: PanelOptions) {
    const timeRange = currentOptions?.timeRange || createDefaultTimeRange();
    const showingQuery = currentOptions?.showingQuery ?? false;
    currentOptions = { ...options, timeRange, showingQuery };
    panel.title = getTitle(options);
    await postMessage({ type: "show_panel", options: currentOptions });
  }

  panel.webview.onDidReceiveMessage(
    async (message: MessageFromWebview) => {
      switch (message.type) {
        case "ready":
          update(currentOptions);
          return;
        case "request_data": {
          const { query, timeRange, id } = message;

          try {
            const absoluteTimeRange =
              timeRange.type === "absolute"
                ? timeRange
                : relativeToAbsoluteTimeRange(timeRange);

            prometheus
              .fetchTimeseries(query, {
                to: absoluteTimeRange.to,
                from: absoluteTimeRange.from,
              })
              .then((data) => {
                postMessage({ type: "show_data", data, id });
              })
              .catch(async (error: unknown) => {
                const errorMessage = formatProviderError(error);

                await postMessage({
                  type: "show_error",
                  id,
                  error: errorMessage,
                });
              });
          } catch (error) {
            const errorMessage = formatProviderError(error);

            await postMessage({
              type: "show_error",
              id,
              error: errorMessage,
            });
          }

          return;
        }
        case "update_time_range": {
          const { timeRange } = message;
          currentOptions = { ...currentOptions, timeRange };
          return;
        }
        case "update_showing_query": {
          const { showingQuery } = message;
          currentOptions = { ...currentOptions, showingQuery };
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
