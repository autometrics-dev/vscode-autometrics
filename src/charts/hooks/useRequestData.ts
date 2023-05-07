import { useRef } from "react";
// import crypto from "crypto";

import { TimeRange, Timeseries } from "fiberplane-charts";
import { useHandler } from "./useHandler";
import { MessageToWebview, vscode } from "..";
import { useMessage } from "./useMessage";
import { getNonce } from "../../utils";
// import { rejects } from "assert";

export type Result<T, E> =
  /**
   * Represents a successful result.
   */
  | { Ok: T }
  /**
   * Represents an error.
   */
  | { Err: E };

export function useRequestData() {
  const requests = useRef<
    Record<string, (result: Result<Timeseries[], String>) => void>
  >({});

  useMessage<MessageToWebview>((event) => {
    if (event.data.type === "show_data") {
      // return
      const { data, id } = event.data;
      const request = requests.current[id];
      if (request) {
        request({ Ok: data });
      }
      // if (event.data.)
    }
  });

  return useHandler((timeRange: TimeRange, query: string) => {
    const id = getNonce();

    const result = new Promise<Timeseries[]>((resolve, rejects) => {
      requests.current[id] = (result: Result<Timeseries[], String>) => {
        delete requests.current[id];
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
    // requests.current[query] =
  });
}
