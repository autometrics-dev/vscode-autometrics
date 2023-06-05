import { createRoot } from "react-dom/client";

import { PanelContent, ChartThemeProvider } from "./components";
import type { MessageFromWebview } from "./types";
import { GraphContextProvider } from "./state";

// rome-ignore lint/style/noNonNullAssertion: Root is defined in `chartPanel.ts`.
const root = createRoot(document.querySelector("#root")!);
root.render(
  <ChartThemeProvider>
    <GraphContextProvider>
      <PanelContent />
    </GraphContextProvider>
  </ChartThemeProvider>,
);

declare function acquireVsCodeApi(): {
  postMessage: (message: MessageFromWebview) => void;
};

export const vscode = acquireVsCodeApi();

vscode.postMessage({ type: "ready" });
