import * as vscode from "vscode";

import { OPEN_PANEL_COMMAND } from "./constants";
import { PanelOptions } from "./chartPanel";

/**
 * Creates a VS Code hover for the given function.
 */
export function createFunctionHover(functionName: string): vscode.Hover {
  const content = `## Autometrics
  
  * [View the live metrics for the \`${functionName}\` function](${getOpenPenelCommand(
    { type: "function", functionName },
  )})
  * [View metrics of functions called by \`${functionName}\`](${getOpenPenelCommand(
    { type: "called_by", functionName },
  )})`;

  const markdown = new vscode.MarkdownString(content);
  markdown.isTrusted = true;

  return new vscode.Hover(markdown);
}

function getOpenPenelCommand(options: PanelOptions): string {
  return `command:${OPEN_PANEL_COMMAND}?${encodeURIComponent(
    JSON.stringify([options]),
  )}`;
}
