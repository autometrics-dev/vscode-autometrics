import type { TimeRange, Timeseries } from "fiberplane-charts";

import type { PanelOptions, GlobalGraphSettings } from "../chartPanel";

export type MessageToWebview =
  | { type: "show_panel"; options: PanelOptions & GlobalGraphSettings }
  | {
      type: "show_data";
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
  | { type: "update_time_range"; timeRange: TimeRange }
  | { type: "update_showing_query"; showingQuery: boolean }
  | { type: "show_notification"; message: string };
