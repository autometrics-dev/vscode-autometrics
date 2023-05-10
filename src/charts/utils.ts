import type { TimeRange } from "fiberplane-charts";

export function getCurrentTimeRange(): TimeRange {
  const now = new Date();
  const oneHourAgo = new Date();
  oneHourAgo.setDate(oneHourAgo.getDate() - 2);
  return { from: oneHourAgo.toISOString(), to: now.toISOString() };
}
