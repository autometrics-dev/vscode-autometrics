import * as vscode from "vscode";

export function createChartPanel(
  context: vscode.ExtensionContext,
  metric: string,
  _labels: Record<string, string> = {},
) {
  const panel = vscode.window.createWebviewPanel(
    "autometricsChart",
    metric,
    vscode.ViewColumn.One,
    { enableScripts: true },
  );

  panel.webview.html = getHtmlForWebview(context, panel.webview);

  return panel;
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
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <title>Autometrics Chart</title>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
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
