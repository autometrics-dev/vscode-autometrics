import parseDuration from "parse-duration";
import type { Timestamp } from "fiberplane-charts";
import {
  AbsoluteTimeRange,
  FlexibleTimeRange,
  RelativeTimeRange,
} from "../types";

export type DateParts = {
  month: number;
  date: number;
  year: number;
  timestamp: Timestamp;
};

export function getDateParts(date: Date): DateParts {
  return {
    month: date.getMonth(),
    date: date.getDate(),
    year: date.getFullYear(),
    timestamp: date.toISOString(),
  };
}

export const timestampToDate = (timestamp: Timestamp): Date =>
  new Date(timestamp);

export const secondsToTimestamp = (seconds: number): Timestamp =>
  new Date(seconds * 1000).toISOString();

export const timestampToSeconds = (timestamp: Timestamp): number =>
  new Date(timestamp).getTime() / 1000;

export const msToTimestamp = (ms: number): Timestamp =>
  new Date(ms).toISOString();

export function createDefaultTimeRange(): FlexibleTimeRange {
  return {
    type: "relative",
    from: "now-1h",
    to: "now",
  };
}

export function relativeToAbsoluteTimeRange(
  timeRange: RelativeTimeRange,
): AbsoluteTimeRange {
  let fromText = timeRange.from.trim().toLowerCase();

  const match = /^now\s?-(?<duration>(.*?))$/.exec(fromText);

  if (!match?.groups?.duration) {
    throw new Error(`Invalid from range: ${timeRange.from}`);
  }

  fromText = match.groups.duration;

  if (timeRange.to.trim().toLowerCase() !== "now") {
    throw new Error(`Invalid to range: expected 'now', got: '${timeRange.to}'`);
  }

  const from = parseDuration(fromText);
  if (from === undefined) {
    throw new Error(`Invalid duration: ${timeRange.from}`);
  }

  const now = Date.now();

  return {
    type: "absolute",
    from: msToTimestamp(now - from),
    to: msToTimestamp(now),
  };
}
