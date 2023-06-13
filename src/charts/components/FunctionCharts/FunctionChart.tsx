import { useContext, useState } from "react";
import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
  TooltipAnchor,
} from "fiberplane-charts";
import styled from "styled-components";
import { CodeBlock } from "../CodeBlock";
import { colors, pxToEm } from "../../utils";
import { Loading } from "../Loading";
import { useSnapshot } from "valtio";
import { GraphContext } from "../../state";
import { useHandler } from "../../hooks";
import { useChartHook } from "../../hooks";
import { ErrorMessage } from "../ErrorMessage";
import { Tooltip } from "../Tooltip";

type Props = {
  query: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  id: string;
};

export function FunctionChart(props: Props) {
  const { query, title, description = "", id } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [stackingType, setStackingType] = useState<StackingType>("none");

  const state = useContext(GraphContext);
  const { showingQuery } = useSnapshot(state);
  const { error, loading, timeSeries, timeRange } = useChartHook(id, query);

  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = timeRange;
  });

  const [tooltip, setTooltip] = useState<{
    anchor: TooltipAnchor;
    content: React.ReactNode;
  } | null>(null);

  return (
    <Container showingQuery={showingQuery}>
      {loading && <Loading />}
      <Content>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Content>
      <Content>
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
          showTooltip={(anchor, content) => {
            setTooltip({ anchor, content });
            return () => setTooltip(null);
          }}
          onToggleTimeseriesVisibility={
            timeSeries && timeSeries.length > 1
              ? ({ timeseries: relevantTimeseries, toggleOthers }) => {
                  const graph = state.graphs[id];
                  if (!graph || !graph.timeSeries) {
                    return;
                  }
                  const selectedIndex = timeSeries.indexOf(relevantTimeseries);

                  // Can't find the index? Bail out
                  if (selectedIndex === -1) {
                    return;
                  }

                  if (toggleOthers) {
                    const othersVisible = graph.timeSeries.some(
                      (ts, index) => ts.visible && index !== selectedIndex,
                    );

                    graph.timeSeries.forEach((ts, index) => {
                      if (index !== selectedIndex) {
                        ts.visible = !othersVisible;
                      } else {
                        ts.visible = true;
                      }
                    });
                  } else {
                    graph.timeSeries[selectedIndex].visible =
                      !relevantTimeseries.visible;
                  }
                }
              : undefined
          }
        />
      </Content>
      {showingQuery && <CodeBlock query={query} />}
      {tooltip && <Tooltip {...tooltip} />}
    </Container>
  );
}

const Container = styled.div<{ showingQuery: boolean }>`
  display: grid;
  grid-template-rows: ${({ showingQuery }) =>
    showingQuery ? "min-content auto 100px" : "min-content auto"};
  gap: ${pxToEm(9)}; // 22px on 13px base;
  position: relative;
  height: 100%;
`;

const Content = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: ${pxToEm(16)}; // 16px on 13px base; 
  line-height: 2.1875; // 35px;
  margin: 0;
  padding: 0 0 0 ${pxToEm(10)};
`;

const Description = styled.div`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: ${pxToEm(10)};// 10px over 13px base;
  line-height: 1.6; // 16px;
  padding: 0 0 0 ${pxToEm(10)};
`;
