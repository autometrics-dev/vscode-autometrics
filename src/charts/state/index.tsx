import { TimeRange, Timeseries } from "fiberplane-charts";
import { ReactNode, createContext, useRef } from "react";
import { proxy } from "valtio";
import { derive } from "valtio/utils";
import { getCurrentTimeRange } from "../utils";

type Graph = {
  timeSeries: null | Timeseries[];
  loading: boolean;
  error: string | null;
};

type GraphState = {
  graphs: Record<string, Graph>;
  timeRange: TimeRange;
  showingQuery: boolean;
};

export const GraphContext = createContext<GraphState>({
  graphs: {},
  timeRange: getCurrentTimeRange(),
  showingQuery: false,
});

export const GlobalLoadingContext = createContext<{ loading: boolean }>({
  loading: false,
});

export function GraphContextProvider(props: { children: ReactNode }) {
  const state = useRef(
    proxy({
      graphs: {},
      timeRange: getCurrentTimeRange(),
      showingQuery: false,
    } as GraphState),
  ).current;

  // Global loading state derived from state.graphs{id].loading
  const globalLoadingState = useRef(
    derive({
      loading: (get) =>
        Object.values(get(state.graphs)).some(({ loading }) => loading),
    }),
  ).current;

  return (
    <GraphContext.Provider value={state}>
      <GlobalLoadingContext.Provider value={globalLoadingState}>
        {props.children}
      </GlobalLoadingContext.Provider>
    </GraphContext.Provider>
  );
}
