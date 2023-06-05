// import * as vscode from "vscode";
import * as React from "react";
import type { TimeRange, Timeseries, Timestamp } from "fiberplane-charts";
import { getNonce } from "../utils";
import { Result } from "../providerRuntime/types";
import { vscode } from "./chart";
// import { vscode } from "./chart";

export function getCurrentTimeRange(): TimeRange {
  const now = new Date();
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return { from: oneHourAgo.toISOString(), to: now.toISOString() };
}

export const colors = [
  "var(--vscode-charts-red)",
  "var(--vscode-charts-blue)",
  "var(--vscode-charts-yellow)",
  "var(--vscode-charts-orange)",
  "var(--vscode-charts-green)",
  "var(--vscode-charts-purple)",
];

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

type AnyEvent =
  | Event
  | React.ClipboardEvent
  | React.FocusEvent
  | React.FormEvent
  | React.MouseEvent
  | React.KeyboardEvent;

/**
 * To cancel an event means to both stop its propagation and
 * to prevent any default action.
 */
export function cancelEvent(event: AnyEvent) {
  stopPropagation(event);
  event.preventDefault();
}

export function stopPropagation(event: AnyEvent) {
  (event as React.SyntheticEvent).nativeEvent?.stopImmediatePropagation();
  event.stopPropagation();
}

export function pxToEm(px: number, baseSize = 13): string {
  return `${px / baseSize}em`;
}

type Keys = keyof TimeRange | "global";

type ValidationResult = {
  values: TimeRange;
  errors: Record<Keys, undefined | string>;
};

export function validateTimeRange(values: TimeRange): ValidationResult {
  const { from: fromValue, to: toValue } = values;
  const parsedFrom = timestampToSeconds(fromValue);
  const parsedTo = timestampToSeconds(toValue);
  let fromError: undefined | string;
  let toError: undefined | string;
  let globalError: undefined | string;

  if (Number.isNaN(parsedFrom)) {
    fromError = "Invalid date entered";
  }

  if (Number.isNaN(parsedTo)) {
    toError = "Invalid date entered";
  }

  if (parsedTo < parsedFrom) {
    globalError = "End date is before start date";
  }

  return {
    values: {
      from: fromError ? fromValue : secondsToTimestamp(parsedFrom),
      to: toError ? toValue : secondsToTimestamp(parsedTo),
    },
    errors: {
      from: fromError,
      to: toError,
      global: globalError,
    },
  };
}

export const secondsToTimestamp = (seconds: number): Timestamp =>
  new Date(seconds * 1000).toISOString();

export const timestampToSeconds = (timestamp: Timestamp): number =>
  new Date(timestamp).getTime() / 1000;

export const msToTimestamp = (ms: number): Timestamp =>
  new Date(ms).toISOString();

const requests: Record<string, (result: Result<Timeseries[], String>) => void> =
  {};

window.addEventListener("message", (event) => {
  if (event.data.type === "show_data") {
    const { data, id } = event.data;
    const request = requests[id];
    if (request) {
      request({ Ok: data });
    }
  } else if (event.data.type === "show_error") {
    const { error, id } = event.data;
    const request = requests[id];
    if (request) {
      request({ Err: error });
    }
  }
});

export function loadGraph(query: string, timeRange: TimeRange) {
  // window.addEventListener("message", handler);
  // return new Promise
  const id = getNonce();

  const result = new Promise<Timeseries[]>((resolve, rejects) => {
    requests[id] = (result: Result<Timeseries[], String>) => {
      delete requests[id];
      if ("Ok" in result) {
        resolve(result.Ok);
      } else {
        rejects(result.Err);
      }
    };
  });

  vscode.postMessage({
    type: "request_data",
    query,
    timeRange,
    id,
  });

  return result;
}
