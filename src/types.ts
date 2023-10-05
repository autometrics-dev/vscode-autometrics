import { TimeRange } from "@fiberplane/fiberplane-charts";

export type AbsoluteTimeRange = {
  type: "absolute";
} & TimeRange;

export type RelativeTimeRange = {
  type: "relative";
  from: string;
  to: string;
};

export type FlexibleTimeRange = AbsoluteTimeRange | RelativeTimeRange;
