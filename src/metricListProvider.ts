import * as vscode from "vscode";

export class MetricListProvider implements vscode.TreeDataProvider<MetricItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    MetricItem | undefined | void
  > = new vscode.EventEmitter<MetricItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<MetricItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private prometheusUrl: string) {}

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

  getChildren(element?: MetricItem): Thenable<MetricItem[]> {
    if (element) {
      // Elements have no children.
      return Promise.resolve([]);
    }

    return Promise.resolve([
      new MetricItem("events_published_total"),
      new MetricItem("events_received_total"),
      new MetricItem("function_calls_count"),
      new MetricItem("function_calls_duration"),
      new MetricItem("http_request_duration_seconds"),
      new MetricItem("http_requests_total"),
      new MetricItem("ws_connections_open"),
      new MetricItem("ws_messages_received_total"),
      new MetricItem("ws_messages_sent_total"),
    ]);
  }
}

export class MetricItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("symbol-function");

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
