import { useEffect, useState } from "react";
import { TimeRangeProps } from "../types";
import { useRequestData } from "../../hooks/useRequestData";
import {
  GraphType,
  MetricsChart,
  StackingType,
  Timeseries,
} from "fiberplane-charts";

type Props = {
  query: string;
  title?: React.ReactNode;
} & TimeRangeProps;

export function FunctionChart(props: Props) {
  const { query, timeRange, setTimeRange, title } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const [timeseriesData, setTimeseriesData] = useState<Array<Timeseries>>([]);

  const requestData = useRequestData();

  useEffect(() => {
    requestData(timeRange, query).then((data) => {
      setTimeseriesData(data);
    });
  }, [query, timeRange]);

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
      />
      <textarea>{query}</textarea>
    </>
  );
}
