import { TimeRange, Timeseries } from "fiberplane-charts";
import { ReactNode, createContext, useEffect, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { derive } from "valtio/utils";
import { vscode } from "../chart";
import { FlexibleTimeRange } from "../../types";
import { createDefaultTimeRange } from "../../utils";

type Graph = {
  timeSeries: null | Timeseries[];
  loading: boolean;
  error: string | null;
};

type GraphState = {
  graphs: Record<string, Graph>;
  timeRange: FlexibleTimeRange;
  showingQuery: boolean;
};

export const GraphContext = createContext<GraphState>({
  graphs: {},
  timeRange: createDefaultTimeRange(),
  showingQuery: false,
});

export const GlobalLoadingContext = createContext<{ loading: boolean }>({
  loading: false,
});

export function GraphContextProvider(props: {
  children: ReactNode;
  initialTimeRange: TimeRange;
  initialShowingQuery: boolean;
}) {
  const state = useRef(
    proxy({
      graphs: {},
      timeRange: props.initialTimeRange,
      showingQuery: props.initialShowingQuery,
    } as GraphState),
  ).current;

  // Global loading state derived from state.graphs{id].loading
  const globalLoadingState = useRef(
    derive({
      loading: (get) =>
        Object.values(get(state.graphs)).some(({ loading }) => loading),
    }),
  ).current;

  const { timeRange, showingQuery } = useSnapshot(state);
  useEffect(() => {
    vscode.postMessage({
      type: "update_time_range",
      timeRange: { ...timeRange },
    });
  }, [timeRange]);

  useEffect(() => {
    vscode.postMessage({
      type: "update_showing_query",
      showingQuery,
    });
  }, [showingQuery]);

  return (
    <GraphContext.Provider value={state}>
      <GlobalLoadingContext.Provider value={globalLoadingState}>
        {props.children}
      </GlobalLoadingContext.Provider>
    </GraphContext.Provider>
  );
}
