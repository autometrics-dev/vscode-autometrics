import * as vscode from "vscode";

import type { FunctionMetric, Prometheus } from "../prometheus";
import { formatProviderError } from "../providerRuntime/errors";
import { OPEN_CHART_COMMAND } from "../constants";

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
      .fetchFunctions()
      .then((functions) =>
        functions
          .sort(compareFunctions)
          .map(
            ({ functionName, moduleName }) =>
              new FunctionItem(moduleName, functionName),
          ),
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

  constructor(moduleName: string, functionName: string) {
    // rome-ignore lint/correctness/noInvalidConstructorSuper: rome doesn't understand that vscode.TreeItem is a class
    super(`${moduleName}::${functionName}`);

    this.command = {
      title: "Open chart",
      command: OPEN_CHART_COMMAND,
      arguments: [{ type: "function", functionName, moduleName }],
    };
  }
}

function compareFunctions(a: FunctionMetric, b: FunctionMetric) {
  if (a.moduleName < b.moduleName) {
    return -1;
  }

  if (a.moduleName > b.moduleName) {
    return 1;
  }

  return a.functionName < b.functionName ? -1 : 1;
}
