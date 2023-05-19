import { useEffect, useState } from "react";
import {
  GraphType,
  MetricsChart,
  StackingType,
  Timeseries,
} from "fiberplane-charts";

import { PanelOptions, SingleChartOptions } from "../../../chartPanel";
import {
  getCalledByRequestRate,
  getRequestRate,
  getSumQuery,
} from "../../../queries";
import { useRequestData } from "../../hooks/useRequestData";
import { TimeRangeProps } from "../types";
import { getTitle } from "../../../utils";
import { CodeBlock } from "../CodeBlock";
import { colors } from "../../utils";

type Props = {
  options: SingleChartOptions;
} & TimeRangeProps;

export function SingleChart(props: Props) {
  const { options, timeRange, setTimeRange } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [query, setQuery] = useState<string | null>(null);
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const [timeseriesData, setTimeseriesData] = useState<Array<Timeseries>>([]);

  const requestData = useRequestData();

  useEffect(() => {
    const query = getQuery(options);

    if (!query) {
      return;
    }

    setQuery(query);
    requestData(timeRange, query).then((data) => {
      setTimeseriesData(data);
    });
  }, [options, timeRange]);

  const title = getTitle(options);

  return (
    <>
      <h1>{title}</h1>
      <MetricsChart
        graphType={graphType}
        stackingType={stackingType}
        timeRange={timeRange}
        timeseriesData={timeseriesData}
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
    </>
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
