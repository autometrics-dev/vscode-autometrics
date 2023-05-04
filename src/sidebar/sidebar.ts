import * as vscode from "vscode";

import { FunctionListProvider } from "./functionListProvider";
import { MetricListProvider } from "./metricListProvider";
import {
  affectsAutometricsConfig,
  getAutometricsConfig,
  getPrometheusUrl,
} from "../config";
import type { Prometheus } from "../prometheus";

export async function activateSidebar(prometheus: Prometheus) {
  const functionListProvider = new FunctionListProvider(prometheus);
  vscode.window.registerTreeDataProvider("functionList", functionListProvider);

  const metricListProvider = new MetricListProvider(prometheus);
  vscode.window.registerTreeDataProvider("metricList", metricListProvider);

  vscode.commands.registerCommand("autometrics.refreshFunctions", () => {
    functionListProvider.refresh();
    metricListProvider.refresh();
  });

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (affectsAutometricsConfig(event)) {
      const prometheusUrl = getPrometheusUrl(getAutometricsConfig());
      prometheus.setUrl(prometheusUrl);
    }
  });
}
