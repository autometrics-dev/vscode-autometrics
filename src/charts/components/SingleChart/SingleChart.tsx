import { useEffect, useState } from "react";
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
import { useRequestData } from "../../hooks/useRequestData";

export function SingleChart(props: {
  options: SingleChartOptions;
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
}) {
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

  return (
    <>
      <h1>{query}</h1>
      <MetricsChart
        graphType={graphType}
        stackingType={stackingType}
        timeRange={timeRange}
        timeseriesData={timeseriesData}
        onChangeGraphType={setGraphType}
        onChangeStackingType={setStackingType}
        onChangeTimeRange={setTimeRange}
      />
    </>
  );
}

/**
 * TODO: For the new design, we should show multiple queries for a given chart
 *       options.
 */
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
