import { useContext, useState } from "react";
import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
} from "fiberplane-charts";
import styled from "styled-components";
import { CodeBlock } from "../CodeBlock";
import { colors, pxToEm } from "../../utils";
import { Loading } from "./Loading";
import { ErrorIcon } from "./ErrorIcon";
import { useSnapshot } from "valtio";
import { GraphContext } from "../../state";
import { useHandler } from "../../hooks";
import { useChartHook } from "../../hooks";

type Props = {
  query: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  id: string;
};

export const FunctionChart = function FunctionChart(props: Props) {
  const { query, title, description = "", id } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [stackingType, setStackingType] = useState<StackingType>("none");

  const state = useContext(GraphContext);
  const { showingQuery } = useSnapshot(state);
  const { error, loading, timeSeries, timeRange } = useChartHook(id, query);

  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = timeRange;
  });

  return (
    <Container showingQuery={showingQuery}>
      {loading && <Loading />}
      <div>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {error && (
          <ErrorMessage>
            <StyledErrorIcon />
            <ErrorMessageText>{error}</ErrorMessageText>
          </ErrorMessage>
        )}
      </div>
      <div>
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
      </div>
      {showingQuery && <CodeBlock query={query} />}
    </Container>
  );
};

const Container = styled.div<{ showingQuery: boolean }>`
  display: grid;
  grid-template-rows: ${({ showingQuery }) =>
    showingQuery ? "min-content auto 100px" : "min-content auto"};
  gap: ${pxToEm(22)}; // 22px on 13px base;
  position: relative;
  height: 100%;
`;

const Title = styled.h2`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: ${pxToEm(16)}; // 16px on 13px base; 
  line-height: 2.1875; // 35px;
  margin: 0;
  padding: 0;
`;

const Description = styled.div`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: ${pxToEm(10)};// 10px over 13px base;
  line-height: 1.6; // 16px;
  padding: 0.3em 0;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  color: var(--vscode-errorForeground, inherit);
  gap: ${pxToEm(8)};
  margin: ${pxToEm(8)} 0 0;
`;

const StyledErrorIcon = styled(ErrorIcon)`
  flex: 0 0 ${pxToEm(23)};
`;

const ErrorMessageText = styled.div`
  overflow-wrap: anywhere;
`;
