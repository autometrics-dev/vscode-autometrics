import { TimeRange } from "fiberplane-charts";

export type AbsoluteTimeRange = {
  type: "absolute";
} & TimeRange;

export type RelativeTimeRange = {
  type: "relative";
  from: string;
  to: "now";
};

export type FlexibleTimeRange = AbsoluteTimeRange | RelativeTimeRange;
