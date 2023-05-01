import type { TimeRange, Timeseries } from "fiberplane-charts";

export type MessageToWebview =
  | { type: "show_metrics"; metric: string; labels: Record<string, string> }
  | { type: "show_data"; timeRange: TimeRange; data: Array<Timeseries> };

export type MessageFromWebview =
  | { type: "ready" }
  | { type: "request_data"; query: string; timeRange: TimeRange };
