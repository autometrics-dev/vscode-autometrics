import { useEffect, useState } from "react";
import { TimeRangeProps } from "../types";
import { useRequestData } from "../../hooks/useRequestData";
import {
  GraphType,
  MetricsChart,
  StackingType,
  Timeseries,
} from "fiberplane-charts";
import styled from "styled-components";

type Props = {
  query: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
} & TimeRangeProps;

export function FunctionChart(props: Props) {
  const { query, timeRange, setTimeRange, title, description = "" } = props;
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
      <div>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </div>
      <div>
        <MetricsChart
          graphType={graphType}
          stackingType={stackingType}
          timeRange={timeRange}
          timeseriesData={timeseriesData}
          onChangeGraphType={setGraphType}
          onChangeStackingType={setStackingType}
          onChangeTimeRange={setTimeRange}
          showChartControls={false}
        />
      </div>
      <textarea defaultValue={query} />
    </>
  );
}

const Title = styled.h2`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 1.231em; // 16px on 13px base; 
  line-height: 2.1875; // 35px;
  margin: 0;
  padding: 0;
`;

const Description = styled.div`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 0.9291em;// 12px over 13px base;
  line-height: 1.5;
  padding: 0.3em 0;
`;
