import type { TimeRange, Timeseries } from "fiberplane-charts";

import type { ChartOptions } from "../chartPanel";

export type MessageToWebview =
  | { type: "show_chart"; options: ChartOptions }
  | { type: "show_data"; timeRange: TimeRange; data: Array<Timeseries> };

export type MessageFromWebview =
  | { type: "ready" }
  | { type: "request_data"; query: string; timeRange: TimeRange };
