import * as vscode from "vscode";

import type { ChartOptions } from "./chartPanel";
import { OPEN_CHART_COMMAND } from "./constants";

/**
 * Creates a VS Code hover for the given function.
 */
export function createFunctionHover(functionName: string): vscode.Hover {
  const content = `## Autometrics
  
  * [View the live metrics for the \`${functionName}\` function](${getOpenChartCommand(
    { type: "function", functionName },
  )})
  * [View metrics of functions called by \`${functionName}\`](${getOpenChartCommand(
    { type: "called_by", functionName },
  )})`;

  const markdown = new vscode.MarkdownString(content);
  markdown.isTrusted = true;

  return new vscode.Hover(markdown);
}

function getOpenChartCommand(options: ChartOptions): string {
  return `command:${OPEN_CHART_COMMAND}?${encodeURIComponent(
    JSON.stringify([options]),
  )}`;
}
