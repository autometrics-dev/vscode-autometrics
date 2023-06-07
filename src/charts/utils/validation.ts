import type { TimeRange } from "fiberplane-charts";
import { secondsToTimestamp, timestampToSeconds } from "./date";

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
