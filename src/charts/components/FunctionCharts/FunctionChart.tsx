import { useEffect, useMemo, useState } from "react";
import { TimeRangeProps } from "../types";
import { useRequestData } from "../../hooks/useRequestData";
import {
  GraphType,
  MetricsChart,
  StackingType,
  Timeseries,
} from "fiberplane-charts";
import styled from "styled-components";
import { CodeBlock } from "../CodeBlock";

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

  const colors = useMemo(
    () => [
      "var(--vscode-charts-red)",
      "var(--vscode-charts-blue)",
      "var(--vscode-charts-yellow)",
      "var(--vscode-charts-orange)",
      "var(--vscode-charts-green)",
      "var(--vscode-charts-purple)",
    ],
    [],
  );

  return (
    <>
      <div>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
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
          chartControlsShown={false}
          gridColumnsShown={false}
          footerShown={false}
          gridBordersShown={false}
          gridDashArray="2"
          colors={colors}
        />
      </div>
      <CodeBlock query={query} />
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
  font-size: 0.7692em;// 10px over 13px base;
  line-height: 1.6; // 16px;
  padding: 0.3em 0;
`;
