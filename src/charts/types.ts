import type { TimeRange, Timeseries } from "fiberplane-charts";

import type { PanelOptions, TimeRangeOptions } from "../chartPanel";

export type MessageToWebview =
  | { type: "show_panel"; options: PanelOptions & TimeRangeOptions }
  | {
      type: "show_data";
      timeRange: TimeRange;
      data: Array<Timeseries>;
      id: string;
    }
  | {
      type: "show_error";
      id: string;
      error: string;
    };

export type MessageFromWebview =
  | { type: "ready" }
  | { type: "request_data"; query: string; timeRange: TimeRange; id: string }
  | { type: "update_time_range"; timeRange: TimeRange };
