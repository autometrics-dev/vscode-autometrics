import type { Timeseries } from "@fiberplane/fiberplane-charts";
import { getNonce } from "../../utils";
import { vscode } from "../chart";
import { FlexibleTimeRange } from "../../types";

type Result<T, E> = { Err: E } | { Ok: T };

const requests = new Map<
  string,
  (result: Result<Timeseries[], String>) => void
>();

window.addEventListener("message", (event) => {
  if (event.data.type === "show_data") {
    const { data, id } = event.data;
    const request = requests.get(id);
    if (request) {
      request({ Ok: data });
    }
  } else if (event.data.type === "show_error") {
    const { error, id } = event.data;
    const request = requests.get(id);
    if (request) {
      request({ Err: error });
    }
  }
});

export function loadGraph(query: string, timeRange: FlexibleTimeRange) {
  const id = getNonce();

  const result = new Promise<Timeseries[]>((resolve, rejects) => {
    requests.set(id, (result: Result<Timeseries[], String>) => {
      // delete requests[id];
      requests.delete(id);
      if ("Ok" in result) {
        resolve(result.Ok);
      } else {
        rejects(result.Err);
      }
    });
  });

  vscode.postMessage({
    type: "request_data",
    query,
    timeRange,
    id,
  });

  return result;
}
