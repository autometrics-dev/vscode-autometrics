import type { Timestamp } from "fiberplane-charts";

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
