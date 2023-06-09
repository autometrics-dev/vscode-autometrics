import { describe, expect, test } from "vitest";
import { relativeToAbsoluteTimeRange } from "./date";
import { RelativeTimeRange } from "../types";

describe("relativeToAbsoluteTimeRange", () => {
  test('returns the correct absolute time range when "from" is valid and "to" is "now"', () => {
    const timeRange: RelativeTimeRange = {
      type: "relative",
      from: "now-7 days",
      to: "now",
    };

    const result = relativeToAbsoluteTimeRange(timeRange);

    const expectedFrom = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const expectedTo = new Date(Date.now()).toISOString();

    expect(result.type).toEqual("absolute");
    expect(result.from).toEqual(expectedFrom);
    expect(result.to).toEqual(expectedTo);
  });

  test('throws an error when "from" is invalid', () => {
    const timeRange: RelativeTimeRange = {
      type: "relative",
      from: "invalid",
      to: "now",
    };

    expect(() => {
      relativeToAbsoluteTimeRange(timeRange);
    }).toThrowError("Invalid from range: invalid");
  });

  test('throws an error when "to" is "now"', () => {
    const timeRange: RelativeTimeRange = {
      type: "relative",
      from: "now-1h",
      to: "invalid",
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    } as any;

    expect(() => {
      relativeToAbsoluteTimeRange(timeRange);
    }).toThrowError("Invalid to range: expected 'now', got: 'invalid'");
  });

  // Add more tests as needed to cover other scenarios
});
