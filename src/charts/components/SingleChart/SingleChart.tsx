import { useContext, useEffect, useState } from "react";
import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
} from "fiberplane-charts";

import { PanelOptions, SingleChartOptions } from "../../../chartPanel";
import {
  getCalledByRequestRate,
  getRequestRate,
  getSumQuery,
} from "../../../queries";
import { useHandler } from "../../hooks";
import { getTitle } from "../../../utils";
import { CodeBlock } from "../CodeBlock";
import { colors, pxToEm } from "../../utils";
import styled from "styled-components";
import { GraphContext } from "../../state";
import { useSnapshot } from "valtio";
import { useChartHook } from "../../hooks";
import { DatePicker } from "../DatePicker";

type Props = {
  options: SingleChartOptions;
};

export function SingleChart(props: Props) {
  const { options } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [query, setQuery] = useState<string | null>(null);
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const state = useContext(GraphContext);

  const { showingQuery } = useSnapshot(state);
  const { error, loading, timeSeries, timeRange } = useChartHook(
    "single",
    query || "",
  );

  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = timeRange;
  });

  // useEffect(() => {
  //   const graph = state.graphs["single"];
  //   if (!graph) {
  //     state.graphs["single"] = {
  //       timeSeries: null,
  //       loading: true,
  //       error: null,
  //     };
  //   }

  //   return () => {
  //     delete state.graphs["single"];
  //   };
  // }, []);

  // const requestData = useRequestData();

  useEffect(() => {
    const query = getQuery(options);

    if (!query) {
      return;
    }

    setQuery(query);
  }, [options]);

  const title = `${options.type} chart for ${getTitle(options)}`;

  return (
    <Container>
      <h1>{title}</h1>
      <DatePicker timeRange={timeRange} onChange={setTimeRange} />
      <MetricsChart
        graphType={graphType}
        stackingType={stackingType}
        timeRange={timeRange}
        timeseriesData={(timeSeries || []) as Timeseries[]}
        onChangeGraphType={setGraphType}
        onChangeStackingType={setStackingType}
        onChangeTimeRange={setTimeRange}
        chartControlsShown={false}
        gridColumnsShown={false}
        footerShown={false}
        gridBordersShown={false}
        gridDashArray="2"
        colors={colors}
      />
      <CodeBlock query={query || ""} />
    </Container>
  );
}

function getQuery(options: PanelOptions) {
  switch (options.type) {
    case "called_by":
      return getCalledByRequestRate(options.functionName);
    case "function":
      return getRequestRate(options.functionName);
    case "metric":
      return getSumQuery(options.metricName);
    default:
      throw Error("This shouldn't happen");
  }
}

const Container = styled.div`
  padding: ${pxToEm(20)};
`;
