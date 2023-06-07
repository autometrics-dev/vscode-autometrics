export const colors = [
  "var(--vscode-charts-red)",
  "var(--vscode-charts-blue)",
  "var(--vscode-charts-yellow)",
  "var(--vscode-charts-orange)",
  "var(--vscode-charts-green)",
  "var(--vscode-charts-purple)",
];

export function pxToEm(px: number, baseSize = 13): string {
  return `${px / baseSize}em`;
}
