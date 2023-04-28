import type { Timestamp } from "fiberplane-charts";

export const timestampToMs = (value: Timestamp) => {
  const date = new Date(value);
  return date.getTime();
};
