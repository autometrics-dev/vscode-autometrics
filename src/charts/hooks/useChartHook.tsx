import { useSnapshot } from "valtio";
import { useHandler } from "./useHandler";
import { GraphContext } from "../state";
import { useContext, useEffect } from "react";
import { TimeRange } from "fiberplane-charts";
import { loadGraph } from "../utils";

export function useChartHook(id: string, query: string) {
  const state = useContext(GraphContext);
  const { graphs, timeRange } = useSnapshot(state);
  const { loading = false, timeSeries = null, error = null } = graphs[id] || {};

  // const setTimeRange = useHandler((timeRange: TimeRange) => {
  //   state.timeRange = timeRange;
  // });

  useEffect(() => {
    // Time range changed
    const graph = state.graphs[id];

    // If the graph is not yet loading. Trigger the loading state
    if (graph?.loading === false) {
      graph.loading = true;
    }
  }, [timeRange, id]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const graph = state.graphs[id];

    // If there's no graph information yet, bail out
    if (!graph) {
      return;
    }

    loadGraph(query, timeRange)
      .then(async (data) => {
        graph.timeSeries = data;
        graph.error = null;
      })
      .catch((error) => {
        if (error instanceof Error) {
          graph.error = error.message;
        } else if (typeof error === "string") {
          graph.error = error;
        } else {
          graph.error = "Unknown error";
        }
      })
      .finally(() => {
        graph.loading = false;
      });
  }, [loading, query, timeRange]);

  // const { loading = false, timeSeries = null, error = null } = graphs[id] || {};
  return { loading, timeSeries, error };
}
