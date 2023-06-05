import { useContext, useEffect, useState } from "react";
import { TimeRangeProps } from "../types";
import {
  GraphType,
  MetricsChart,
  StackingType,
  Timeseries,
} from "fiberplane-charts";
import styled from "styled-components";
import { CodeBlock } from "../CodeBlock";
import { colors, loadGraph, pxToEm } from "../../utils";
import { Loading } from "./Loading";
import { ErrorIcon } from "./ErrorIcon";
import { useSnapshot } from "valtio";
import { GraphContext } from "../../state";

type Props = {
  query: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  id: string;
} & TimeRangeProps;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FunctionChart = function FunctionChart(props: Props) {
  const { query, timeRange, setTimeRange, title, description = "", id } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [stackingType, setStackingType] = useState<StackingType>("none");

  const state = useContext(GraphContext);

  useEffect(() => {
    const graph = state.graphs[id];
    if (!graph) {
      state.graphs[id] = {
        timeSeries: null,
        loading: true,
        error: null,
      };
    }
  }, [id]);

  const { graphs, showingQuery } = useSnapshot(state);
  const { loading = false, timeSeries = null, error = null } = graphs[id] || {};

  useEffect(() => {
    // Time range changed
    const graph = state.graphs[id];

    // If the graph is not yet loading. Trigger the loading state
    if (graph?.loading === false) {
      graph.loading = true;
    }
  }, [timeRange, id]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const graph = state.graphs[id];

    // If there's no graph information yet, bail out
    if (!graph) {
      return;
    }

    loadGraph(query, timeRange)
      .then(async (data) => {
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

  return (
    <Container>
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

const Container = styled.div`
  display: grid;
  grid-template-rows: min-content auto auto;
  gap: ${pxToEm(22)}; // 22px on 13px base;
  position: relative;
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
