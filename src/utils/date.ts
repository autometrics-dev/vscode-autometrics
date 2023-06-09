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
  const duration = getFromNowDuration(timeRange.from.trim().toLowerCase());
  if (duration === null) {
    throw new Error(`Invalid from range: ${timeRange.from}`);
  }

  if (!validateRelativeTo(timeRange.to)) {
    throw new Error(`Invalid to range: expected 'now', got: '${timeRange.to}'`);
  }

  const now = Date.now();
  return {
    type: "absolute",
    from: msToTimestamp(now - duration),
    to: msToTimestamp(now),
  };
}

/**
 * Get the duration from a human readable duration. Expecting a string like "now-1h".
 * and returning the value in milliseconds.
 */
function getFromNowDuration(from: string): number | null {
  const match = /^now\s?-(?<duration>(.*?))$/.exec(from);

  if (!match?.groups?.duration) {
    return null;
  }

  const duration = match.groups.duration;
  return parseDuration(duration) ?? null;
}

function validateRelativeTo(to: string): boolean {
  return to.trim().toLowerCase() === "now";
}
