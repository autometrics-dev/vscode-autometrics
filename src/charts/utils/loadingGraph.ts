import type { TimeRange, Timeseries } from "fiberplane-charts";
import type { Result } from "../../providerRuntime/types";
import { getNonce } from "../../utils";
import { vscode } from "../chart";

const requests: Record<string, (result: Result<Timeseries[], String>) => void> =
  {};

window.addEventListener("message", (event) => {
  if (event.data.type === "show_data") {
    const { data, id } = event.data;
    const request = requests[id];
    if (request) {
      request({ Ok: data });
    }
  } else if (event.data.type === "show_error") {
    const { error, id } = event.data;
    const request = requests[id];
    if (request) {
      request({ Err: error });
    }
  }
});

export function loadGraph(query: string, timeRange: TimeRange) {
  const id = getNonce();

  const result = new Promise<Timeseries[]>((resolve, rejects) => {
    requests[id] = (result: Result<Timeseries[], String>) => {
      delete requests[id];
      if ("Ok" in result) {
        resolve(result.Ok);
      } else {
        rejects(result.Err);
      }
    };
  });

  vscode.postMessage({
    type: "request_data",
    query,
    timeRange,
    id,
  });

  return result;
}
