import { useSnapshot } from "valtio";
import { GraphContext } from "../state";
import { useContext, useEffect, useMemo } from "react";
import { loadGraph } from "../utils";
import { relativeToAbsoluteTimeRange } from "../../utils";

export function useChartHook(id: string, query: string) {
  const state = useContext(GraphContext);
  const { graphs, timeRange } = useSnapshot(state);
  const { loading = false, timeSeries = null, error = null } = graphs[id] || {};

  const absoluteTimeRange = useMemo(() => {
    const value =
      timeRange.type === "relative"
        ? relativeToAbsoluteTimeRange(timeRange)
        : timeRange;
    return { from: value.from, to: value.to };
  }, [timeRange]);

  useEffect(() => {
    const graph = state.graphs[id];
    if (!graph) {
      state.graphs[id] = {
        timeSeries: null,
        loading: true,
        error: null,
      };
    }

    return () => {
      delete state.graphs[id];
    };
  }, [id]);

  useEffect(() => {
    // Time range changed
    const graph = state.graphs[id];

    // If the graph is not yet loading. Trigger the loading state
    if (graph?.loading === false) {
      graph.loading = true;
    }
  }, [timeRange, id]);

  useEffect(() => {
    // If we're not loading or there's no query, bail out
    if (!loading || !query) {
      return;
    }

    const graph = state.graphs[id];

    // If there's no graph information yet, bail out
    if (!graph) {
      return;
    }

    loadGraph(query, { type: "absolute", ...absoluteTimeRange })
      .then((data) => {
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

  return { loading, timeSeries, error, timeRange: absoluteTimeRange };
}
