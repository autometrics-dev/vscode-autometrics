import { createRoot } from "react-dom/client";

import { ChartThemeProvider } from "./ChartThemeSelector";

// rome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.querySelector("#root")!);

function start() {
  root.render(
    <ChartThemeProvider>
      <h1>Hello</h1>
    </ChartThemeProvider>,
  );
}

start();
