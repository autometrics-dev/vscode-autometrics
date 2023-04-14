import * as vscode from "vscode";

import type { AutoSuggestRequest, Prometheus, Suggestion } from "./prometheus";
import { fromQueryData, parseBlob } from "./providerRuntime/blobs";
import { unwrap } from "./providerRuntime/unwrap";
import { encodeQueryData } from "./providerRuntime/queryData";
import {
  SUGGESTIONS_MIME_TYPE,
  SUGGESTIONS_QUERY_TYPE,
  TIMESERIES_MIME_TYPE,
} from "./providerRuntime/constants";
import { matchesMimeTypeWithEncoding } from "./providerRuntime/matchesMimeTypes";

export class MetricListProvider implements vscode.TreeDataProvider<MetricItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    MetricItem | undefined | void
  > = new vscode.EventEmitter<MetricItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<MetricItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private prometheus: Prometheus, private prometheusUrl: string) {}

  setPrometheusUrl(prometheusUrl: string): void {
    this.prometheusUrl = prometheusUrl;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MetricItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MetricItem): Thenable<Array<MetricItem>> {
    if (element) {
      // Metrics have no children.
      return Promise.resolve([]);
    }

    const queryData: AutoSuggestRequest = {
      query_type: TIMESERIES_MIME_TYPE,
      query: "",
      field: "query",
    };

    const invoke = this.prometheus.invoke2;
    if (!invoke) {
      throw new Error("invoke2() not loaded");
    }

    return invoke({
      config: { url: this.prometheusUrl },
      queryData: fromQueryData(encodeQueryData(queryData)),
      queryType: SUGGESTIONS_QUERY_TYPE,
    })
      .then(unwrap)
      .then((blob) => {
        if (
          !matchesMimeTypeWithEncoding(blob.mimeType, SUGGESTIONS_MIME_TYPE)
        ) {
          throw new Error(`Unexpected MIME type: ${blob.mimeType}`);
        }

        return parseBlob(blob) as Array<Suggestion>;
      })
      .then((suggestions) =>
        suggestions
          .filter((suggestion) => suggestion.description !== "Function")
          .map((suggestion) => new MetricItem(suggestion.text)),
      );
  }
}

export class MetricItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("graph");

  contextValue = "metric";

  constructor(metric: string) {
    super(metric);

    this.command = {
      title: "Open chart",
      command: "autometrics.graph.open",
      arguments: [metric],
    };
  }
}
