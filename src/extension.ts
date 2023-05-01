import * as vscode from "vscode";

import { MetricListProvider } from "./metricListProvider";
import { buildQuery, getContent, getRequestRate } from "./content";
import { hasAutometricsDecorator } from "./decorator";
import { FunctionListProvider } from "./functionListProvider";
import { loadPrometheusProvider } from "./prometheus";
import { ChartPanel, createChartPanel } from "./chartPanel";

// rome-ignore lint/suspicious/noExplicitAny: WASM is supported, the types just aren't complete...
declare const WebAssembly: any;

const typescriptExtensionId = "vscode.typescript-language-features";
const tsPluginId = "@autometrics/typescript-plugin";
const configSection = "autometrics";

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position,
): string | void {
  const textLine = document.lineAt(position.line);
  const functionRegex = /^(?<indentation>\s*)def\s*(?<name>[\dA-z]+)?\s*\(/;
  const match = textLine.text.match(functionRegex);
  const name = match?.groups?.name;
  const indentation = match?.groups?.indentation ?? "";

  if (
    name &&
    position.line > 1 &&
    hasAutometricsDecorator(document, position.line - 1, indentation)
  ) {
    return name;
  }
}

function getChartsEnabled(config: vscode.WorkspaceConfiguration): boolean {
  return config.experimentalChartsEnabled ?? false;
}

function getPrometheusUrl(config: vscode.WorkspaceConfiguration): string {
  return config.prometheusUrl || "http://localhost:9090/";
}

export const PythonHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return new vscode.Hover(getContent(name));
    }

    return undefined;
  },
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  activatePythonSupport();
  activateTypeScriptSupport();

  activateSidebar(context);
}

function activatePythonSupport() {
  vscode.languages.registerHoverProvider("python", PythonHover);
}

async function activateTypeScriptSupport() {
  const tsExtension = vscode.extensions.getExtension(typescriptExtensionId);
  if (!tsExtension) {
    return;
  }

  await tsExtension.activate();

  if (!tsExtension.exports || !tsExtension.exports.getAPI) {
    return;
  }

  const tsExtensionApi = tsExtension.exports.getAPI(0);
  if (!tsExtensionApi) {
    return;
  }

  // rome-ignore lint/suspicious/noExplicitAny: pluginAPI is not typed
  function configureTSPlugin(api: any) {
    const config = vscode.workspace.getConfiguration(configSection);
    console.log(`Configuring TS plugin with ${config.prometheusUrl}`);
    api.configurePlugin(tsPluginId, {
      prometheusUrl: getPrometheusUrl(config),
    });
  }

  configureTSPlugin(tsExtensionApi);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(configSection)) {
      configureTSPlugin(tsExtensionApi);
    }
  });
}

async function activateSidebar(context: vscode.ExtensionContext) {
  let config = vscode.workspace.getConfiguration(configSection);
  const prometheusUrl = getPrometheusUrl(config);
  const prometheus = await loadPrometheusProvider(prometheusUrl);

  let chartPanel: ChartPanel | null = null;

  vscode.commands.registerCommand(
    "autometrics.graph.open",
    (metric: string, labels: Record<string, string> = {}) => {
      // Redirect to Prometheus if charts are disabled.
      if (!getChartsEnabled(config)) {
        const options = { baseUrl: prometheusUrl };

        let url;
        if (labels.functionName) {
          url = getRequestRate(labels.functionName, options);
        } else {
          url = buildQuery(
            `sum by (function, module) (rate(${metric}[5m]))`,
            options,
          );
        }

        vscode.env.openExternal(vscode.Uri.parse(url));
        return;
      }

      // Reuse existing panel if available.
      if (chartPanel) {
        chartPanel.showMetric(metric, labels);
        chartPanel.reveal();
        return;
      }

      const panel = createChartPanel(context, prometheus, metric, labels);
      panel.onDidDispose(() => {
        chartPanel = null;
      });
      chartPanel = panel;
    },
  );

  const functionListProvider = new FunctionListProvider(prometheus);
  vscode.window.registerTreeDataProvider("functionList", functionListProvider);

  const metricListProvider = new MetricListProvider(prometheus);
  vscode.window.registerTreeDataProvider("metricList", metricListProvider);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(configSection)) {
      config = vscode.workspace.getConfiguration(configSection);
      const prometheusUrl = getPrometheusUrl(config);
      prometheus.setUrl(prometheusUrl);
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
