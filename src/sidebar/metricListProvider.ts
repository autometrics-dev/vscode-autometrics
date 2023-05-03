import * as vscode from "vscode";

import type { Prometheus } from "../prometheus";
import { OPEN_CHART_COMMAND } from "../constants";

export class MetricListProvider implements vscode.TreeDataProvider<MetricItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    MetricItem | undefined | void
  > = new vscode.EventEmitter<MetricItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<MetricItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private prometheus: Prometheus) {
    prometheus.onDidChangConfig(this.refresh.bind(this));
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

    return this.prometheus
      .fetchMetricNames()
      .then((metrics) => metrics.map((metric) => new MetricItem(metric)));
  }
}

export class MetricItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("graph");

  contextValue = "metric";

  constructor(metricName: string) {
    super(metricName);

    this.command = {
      title: "Open chart",
      command: OPEN_CHART_COMMAND,
      arguments: [{ type: "metric", metricName }],
    };
  }
}
