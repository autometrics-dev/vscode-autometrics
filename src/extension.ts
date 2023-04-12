// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from "vscode";
import { getContent } from "./content";
import { hasAutometricsDecorator } from "./decorator";

const typescriptExtensionId = "vscode.typescript-language-features";
const tsPluginId = "@autometrics/typescript-plugin";
const configSection = "autometrics";

/**
 * Returns either a string or undefined if the document/position
 * don't justify showing a tooltip
 */
function getFunctionName(
  document: vscode.TextDocument,
  position: vscode.Position
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

export const PythonHover = {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const name = getFunctionName(document, position);
    if (name) {
      return new vscode.Hover(getContent(name));
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  },
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate() {
  //Python
  vscode.languages.registerHoverProvider("python", PythonHover);

  //Typescript
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

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(configSection)) {
      configureTSPlugin(tsExtensionApi);
    }
  });

  configureTSPlugin(tsExtensionApi);
}


function configureTSPlugin(api: any) {
  const config = vscode.workspace.getConfiguration(configSection);
  console.log(`Configuring TS plugin with ${config.prometheusUrl}`);
  api.configurePlugin(tsPluginId, {
    prometheusUrl: config.prometheusUrl || "http://localhost:9090/",
  });
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
