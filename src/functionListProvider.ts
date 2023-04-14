import * as vscode from "vscode";

import type { Prometheus, Timeseries } from "./prometheus";
import { encodeQueryData } from "./providerRuntime/queryData";
import { fromQueryData, parseBlob } from "./providerRuntime/blobs";
import {
  TIMESERIES_MIME_TYPE,
  TIMESERIES_QUERY_TYPE,
} from "./providerRuntime/constants";
import { unwrap } from "./providerRuntime/unwrap";
import { matchesMimeTypeWithEncoding } from "./providerRuntime/matchesMimeTypes";
import { uniq } from "./uniq";

export class FunctionListProvider
  implements vscode.TreeDataProvider<FunctionItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FunctionItem | undefined | void
  > = new vscode.EventEmitter<FunctionItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<FunctionItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private prometheus: Prometheus, private prometheusUrl: string) {}

  setPrometheusUrl(prometheusUrl: string): void {
    this.prometheusUrl = prometheusUrl;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FunctionItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FunctionItem): Thenable<FunctionItem[]> {
    if (element) {
      // Metrics have no children.
      return Promise.resolve([]);
    }

    const queryData = {
      query: "function_calls_count",
      time_range: "2023-04-14T12:06:40Z 2023-04-14T12:12:00Z",
    };

    const invoke = this.prometheus.invoke2;
    if (!invoke) {
      throw new Error("invoke2() not loaded");
    }

    // return Promise.resolve([new FunctionItem("helaas")]);

    return invoke({
      config: { url: this.prometheusUrl },
      queryData: fromQueryData(encodeQueryData(queryData)),
      queryType: TIMESERIES_QUERY_TYPE,
    })
      .then(unwrap)
      .then((blob) => {
        if (!matchesMimeTypeWithEncoding(blob.mimeType, TIMESERIES_MIME_TYPE)) {
          throw new Error(`Unexpected MIME type: ${blob.mimeType}`);
        }

        return parseBlob(blob) as Array<Timeseries>;
      })
      .then((array) =>
        uniq(
          array.map(
            (series) => `${series.labels.module}::${series.labels.function}`,
          ),
        )
          .sort()
          .map((functionName) => new FunctionItem(functionName)),
      );
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
