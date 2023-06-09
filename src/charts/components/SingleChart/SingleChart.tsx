import { useContext, useEffect, useMemo, useState } from "react";
import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
  TooltipAnchor,
} from "fiberplane-charts";

import { PanelOptions, SingleChartOptions } from "../../../chartPanel";
import {
  getCalledByRequestRate,
  getRequestRate,
  getSumQuery,
} from "../../../queries";
import { useHandler, useChartHook } from "../../hooks";
import { getTitle } from "../../../utils";
import { CodeBlock } from "../CodeBlock";
import { colors, pxToEm } from "../../utils";
import styled from "styled-components";
import { GraphContext } from "../../state";
import { GraphContainer } from "../GraphContainer";
import { Loading } from "../Loading";
import { ErrorMessage } from "../ErrorMessage";
import { useSnapshot } from "valtio";
import { Tooltip } from "../Tooltip";

type Props = {
  options: SingleChartOptions;
};

export function SingleChart(props: Props) {
  const { options } = props;
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const state = useContext(GraphContext);
  const { showingQuery } = useSnapshot(state);
  const query = getQuery(options);
  const id = "Single";
  const { error, loading, timeSeries, timeRange } = useChartHook(id, query);

  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = {
      type: "absolute",
      ...timeRange,
    };
  });

  useEffect(() => {
    const graph = state.graphs[id];

    if (graph) {
      graph.loading = true;
    }
  }, [query]);

  const [tooltip, setTooltip] = useState<{
    anchor: TooltipAnchor;
    content: React.ReactNode;
  } | null>(null);

  const title = `${options.type} chart for ${getTitle(options)}`;

  return (
    <GraphContainer title={title}>
      <Container>
        {loading && <Loading />}
        {error && <ErrorMessage>{error}</ErrorMessage>}
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
        />
        {showingQuery && <CodeBlock query={query || ""} />}
        {tooltip && <Tooltip {...tooltip} />}
      </Container>
    </GraphContainer>
  );
}

function getQuery(options: PanelOptions) {
  switch (options.type) {
    case "called_by":
      return getCalledByRequestRate(options.functionName);
    case "function":
      return getRequestRate(
        options.functionName,
        options.moduleName
          ? {
              module: options.moduleName,
            }
          : undefined,
      );
    case "metric":
      return getSumQuery(options.metricName);
    default:
      throw Error("This shouldn't happen");
  }
}

const Container = styled.div`
  padding: ${pxToEm(20)};
  position: relative;
`;
