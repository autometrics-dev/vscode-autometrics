import * as vscode from "vscode";

import {
  affectsAutometricsConfig,
  getAutometricsConfig,
  getPrometheusUrl,
} from "../../config";
import { QuickInfo, SymbolDisplayPart } from "typescript";
import { createFunctionHover } from "../../functionHover";

const typescriptExtensionId = "vscode.typescript-language-features";
const denoExtensionId = "denoland.vscode-deno";
const tsPluginId = "@autometrics/typescript-plugin";

export async function activateTypeScriptSupport() {
  vscode.languages.registerHoverProvider("typescript", TypescriptHover);
  const tsExtension = vscode.extensions.getExtension(typescriptExtensionId);
  if (!tsExtension) {
    console.log("NO EXTENSION");
    return;
  }

  const denoExtension = vscode.extensions.getExtension(denoExtensionId);
  if (!denoExtension) {
    console.log("NO DENO EXTENSION... but i shall continue");
    // return;
  } else {
    console.log("DENO EXTENSION", denoExtension);
  }

  await tsExtension.activate();

  await denoExtension?.activate();

  const tsExtensionApi = tsExtension.exports?.getAPI?.(0);

  const denoExtensionApi = denoExtension?.exports?.getAPI?.(0);

  console.log("DENO EXTENSION... exports?  ", denoExtension?.exports?.());

  if (!tsExtensionApi) {
    console.log("NO EXTENSION API");
    return;
  }

  console.log("COFIGURING");

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
        console.log("hohohi", result)

      if (
        result.type === "response" &&
        result.body &&
        result.body.documentation
      ) {
        console.log("hi")
        const functionName = extractAutometricsInfo(result.body.documentation);
        if (functionName) {
          return createFunctionHover(functionName);
        }
      }
      return undefined;
    } catch (err) {
      console.error(err);
      // NOTE - This could happen because of an error in other TS plugins
      //        I.e., we could end up propagating errors from other plugins
      //        (This happened to me with the tailwind intellisense plugin)
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
