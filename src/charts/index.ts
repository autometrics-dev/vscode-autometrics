// This `index.ts` doesn't "do" anything, it merely exports types that are
// reused across the webview and the extension host.
//
// If you are looking for the entry point to the charts, look at `chart.tsx`,
// which gets bundled and loaded into the webview.

export type { MessageFromWebview, MessageToWebview } from "./types";
