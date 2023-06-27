import * as vscode from "vscode";

import {
  affectsAutometricsConfig,
  getAutometricsConfig,
  getPrometheusUrl,
} from "../../config";
import { QuickInfo, SymbolDisplayPart } from "typescript";
import { createFunctionHover } from "../../functionHover";

const typescriptExtensionId = "vscode.typescript-language-features";
const tsPluginId = "@autometrics/typescript-plugin";

export async function activateTypeScriptSupport() {
  vscode.languages.registerHoverProvider("typescript", TypescriptHover);
  const tsExtension = vscode.extensions.getExtension(typescriptExtensionId);
  if (!tsExtension) {
    return;
  }

  await tsExtension.activate();

  const tsExtensionApi = tsExtension.exports?.getAPI?.(0);
  if (!tsExtensionApi) {
    return;
  }

  // rome-ignore lint/suspicious/noExplicitAny: pluginAPI is not typed
  function configureTSPlugin(api: any) {
    const config = getAutometricsConfig();
    const prometheusUrl = getPrometheusUrl(config);
    console.log(`Configuring TS plugin with ${prometheusUrl}`);
    const options = {
      prometheusUrl,
      docsOutputFormat: "vscode",
    };
    api.configurePlugin(tsPluginId, options);
  }

  configureTSPlugin(tsExtensionApi);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (affectsAutometricsConfig(event)) {
      configureTSPlugin(tsExtensionApi);
    }
  });
}

type RequestResponse<T> =
  | {
      body: T;
      request_seq: number;
      command: string;
      success: boolean;
      type: "response";
    }
  | {
      type: "noContent";
    };

export const TypescriptHover = {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    try {
      const result = await vscode.commands.executeCommand<
        RequestResponse<QuickInfo>
      >("typescript.tsserverRequest", "quickinfo", {
        file: document.uri.fsPath,
        line: position.line + 1,
        offset: position.character,
      });

      if (
        result.type === "response" &&
        result.body &&
        result.body.documentation
      ) {
        const functionName = extractAutometricsInfo(result.body.documentation);
        if (functionName) {
          return createFunctionHover(functionName);
        }
      }
      return undefined;
    } catch (err) {
      vscode.window.showErrorMessage(
        "Autometrics: Error getting TypeScript hover info",
      );
    }
    return undefined;
  },
};

const regex = /<!-- autometrics_fn:(?<functionName>.*?)-->/;
function extractAutometricsInfo(docs: SymbolDisplayPart[]) {
  for (const doc of docs) {
    if (doc.kind === "string") {
      const match = doc.text.match(regex);
      const functionName = match?.groups?.functionName;
      if (functionName !== undefined) {
        return functionName.trim();
      }
    }
  }
  return null;
}
