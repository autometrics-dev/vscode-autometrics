import type { TimeRange, Timeseries } from "fiberplane-charts";

import type { PanelOptions, GlobalGraphSettings } from "../chartPanel";
import { FlexibleTimeRange } from "../types";

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
  | {
      type: "request_data";
      query: string;
      timeRange: FlexibleTimeRange;
      id: string;
    }
  | { type: "update_time_range"; timeRange: FlexibleTimeRange }
  | { type: "update_showing_query"; showingQuery: boolean };
