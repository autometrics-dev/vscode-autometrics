import * as vscode from "vscode";

import { OPEN_PANEL_COMMAND } from "./constants";
import { PanelOptions } from "./chartPanel";

/**
 * Creates a VS Code hover for the given function.
 */
export function createFunctionHover(functionName: string): vscode.Hover {
  const content = `## Autometrics
[View the live metrics](${getOpenPanelCommand({
    type: "function_graphs",
    functionName,
  })})
`;

  const markdown = new vscode.MarkdownString(content);
  markdown.isTrusted = true;

  return new vscode.Hover(markdown);
}

function getOpenPanelCommand(options: PanelOptions): string {
  return `command:${OPEN_PANEL_COMMAND}?${encodeURIComponent(
    JSON.stringify([options]),
  )}`;
}
