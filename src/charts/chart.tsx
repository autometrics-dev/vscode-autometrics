import { createRoot } from "react-dom/client";

import { Chart, ChartThemeProvider } from "./components";
import type { MessageFromWebview } from "./types";

// rome-ignore lint/style/noNonNullAssertion: Root is defined in `chartPanel.ts`.
const root = createRoot(document.querySelector("#root")!);
root.render(
  <ChartThemeProvider>
    <Chart />
  </ChartThemeProvider>,
);

declare function acquireVsCodeApi(): {
  postMessage: (message: MessageFromWebview) => void;
};

export const vscode = acquireVsCodeApi();

vscode.postMessage({ type: "ready" });
