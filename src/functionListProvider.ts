import * as vscode from "vscode";

import type { Prometheus } from "./prometheus";
import { formatProviderError } from "./providerRuntime/errors";

export class FunctionListProvider
  implements vscode.TreeDataProvider<FunctionItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FunctionItem | undefined | void
  > = new vscode.EventEmitter<FunctionItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<FunctionItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private prometheus: Prometheus) {
    prometheus.onDidChangConfig(this.refresh.bind(this));
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FunctionItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FunctionItem): Thenable<FunctionItem[]> {
    if (element) {
      // Functions have no children.
      return Promise.resolve([]);
    }

    return this.prometheus
      .fetchFunctionNames()
      .then((functionNames) =>
        functionNames
          .sort()
          .map((functionName) => new FunctionItem(functionName)),
      )
      .catch((error) => {
        vscode.window.showErrorMessage(
          `Could not fetch Autometrics functions from Prometheus: ${formatProviderError(
            error,
          )}`,
        );
        throw error;
      });
  }
}

export class FunctionItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("symbol-function");

  contextValue = "function";

  constructor(functionName: string) {
    super(functionName);

    this.command = {
      title: "Open chart",
      command: "autometrics.graph.open",
      arguments: ["function_calls_count", { functionName }],
    };
  }
}
