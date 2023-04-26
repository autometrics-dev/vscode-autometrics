import { createRoot } from "react-dom/client";

import { ChartThemeProvider } from "./ChartThemeSelector";
import { MessageFromWebview, MessageToWebview } from "./types";

// rome-ignore lint/style/noNonNullAssertion: Root is defined in `chartPanel.ts`.
const root = createRoot(document.querySelector("#root")!);

declare function acquireVsCodeApi(): {
  postMessage: (message: MessageFromWebview) => void;
};

const vscode = acquireVsCodeApi();

function start() {
  vscode.postMessage({ type: "ready" });

  window.onmessage = (event) => {
    root.render(
      <ChartThemeProvider>
        <h1>Hello: {event.data.type}</h1>
      </ChartThemeProvider>,
    );
  };

  root.render(
    <ChartThemeProvider>
      <h1>Hello</h1>
    </ChartThemeProvider>,
  );
}

start();
