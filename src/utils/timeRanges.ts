import type { TimeRange } from "fiberplane-charts";

import { timestampToMs } from "./timestamps";

/**
 * Formats a time range to be included in the query data.
 */
export function formatTimeRange(timeRange: TimeRange): string {
  return `${timeRange.from} ${timeRange.to}`;
}

export const isSameTimeRange = (a: TimeRange, b: TimeRange): boolean =>
  a === b ||
  (a.from === b.from && a.to === b.to) ||
  (timestampToMs(a.from) === timestampToMs(b.from) &&
    timestampToMs(a.to) === timestampToMs(b.to));
