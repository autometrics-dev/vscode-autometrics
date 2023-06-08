import type { TimeRange } from "fiberplane-charts";

export function createDefaultTimeRange(): TimeRange {
  const now = new Date();
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return { from: oneHourAgo.toISOString(), to: now.toISOString() };
}
