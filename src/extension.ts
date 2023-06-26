import * as vscode from "vscode";

import {
  activatePythonSupport,
  activateRustSupport,
  activateTypeScriptSupport,
} from "./languages";
import { activateSidebar } from "./sidebar";
import { getAutometricsConfig, getPrometheusUrl } from "./config";
import { loadPrometheusProvider } from "./prometheus";
import { registerChartPanel } from "./chartPanel";

// rome-ignore lint/suspicious/noExplicitAny: WASM is supported, the types just aren't complete...
declare const WebAssembly: any;

export async function activate(context: vscode.ExtensionContext) {
  activatePythonSupport();
  await activateRustSupport(context);
  await activateTypeScriptSupport();

  const config = getAutometricsConfig();
  const prometheusUrl = getPrometheusUrl(config);
  const prometheus = await loadPrometheusProvider(prometheusUrl);

  await activateSidebar(prometheus);
  registerChartPanel(context, prometheus);
}

// This method is called when your extension is deactivated
export function deactivate() {}
