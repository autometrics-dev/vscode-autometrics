import type { TimeRange } from "fiberplane-charts";

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
