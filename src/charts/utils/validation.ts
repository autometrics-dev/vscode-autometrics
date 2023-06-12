import type { TimeRange } from "fiberplane-charts";
import {
  getNowDuration,
  secondsToTimestamp,
  timestampToSeconds,
  validateRelativeTo,
} from "../../utils";
import { FlexibleTimeRange } from "../../types";

type Keys = keyof TimeRange | "global";

type ValidationResult = {
  values: FlexibleTimeRange;
  errors: Record<Keys, undefined | string>;
};

function validateAsAbsoluteTimeRange(
  fromValue: string,
  toValue: string,
): ValidationResult {
  let fromError: undefined | string;
  let toError: undefined | string;
  let globalError: undefined | string;

  const parsedFrom = timestampToSeconds(fromValue);
  if (Number.isNaN(parsedFrom)) {
    fromError = "Invalid date entered";
  }

  const parsedTo = timestampToSeconds(toValue);
  if (Number.isNaN(parsedTo)) {
    toError = "Invalid date entered";
  }

  if (parsedTo < parsedFrom) {
    globalError = "End date is before start date";
  }

  return {
    values: {
      type: "absolute",
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

function validateAsRelativeTimeRange(
  fromValue: string,
  toValue: string,
): ValidationResult {
  let fromError: undefined | string;
  let toError: undefined | string;
  let globalError: undefined | string;

  const fromNow = getNowDuration(fromValue.trim().toLowerCase());
  if (fromNow === null) {
    fromError = `Invalid from range: ${fromValue}, expected something like: "now-1h"`;
  }

  const toNow = getNowDuration(toValue.trim().toLowerCase());
  if (toNow === null) {
    toError = `Invalid to range: ${fromValue}, expected something like: "now"`;
  }

  if (toNow && fromNow && toNow < fromNow) {
    globalError = "End date is before start date";
  }

  return {
    values: {
      type: "relative",
      from: fromValue,
      to: toValue,
    },
    errors: {
      from: fromError,
      to: toError,
      global: globalError,
    },
  };
}

export function validateTimeRange(values: TimeRange): ValidationResult {
  const { from: fromValue, to: toValue } = values;

  if (fromValue.includes("now") || toValue.includes("now")) {
    return validateAsRelativeTimeRange(fromValue, toValue);
  }

  return validateAsAbsoluteTimeRange(fromValue, toValue);
}
