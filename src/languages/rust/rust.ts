import * as vscode from "vscode";

import { getAutometricsConfig, getGraphPreferences } from "../../config";
import {
  activateExperimentalSupport,
  cleanupExperimentalSupport,
} from "./experimental";
import { activateExplorer, deactivateExplorer } from "./explorer";

// TODO: See https://github.com/autometrics-dev/vscode-autometrics/issues/27
//       for tracking the Rust implementation.
export async function activateRustSupport(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async () => {
      await init(context);
    }),
  );

  await init(context);
}

async function init(context: vscode.ExtensionContext) {
  const config = getAutometricsConfig();
  if (config.experimentalRustSupport) {
    await activateExperimentalSupport(context);
  } else {
    cleanupExperimentalSupport(context);
  }

  const graphPreferences = getGraphPreferences(config);

  if (graphPreferences === "explorer") {
    await activateExplorer(context);
  } else {
    await deactivateExplorer(context);
  }
}
