import { FunctionChart } from "./FunctionChart";
import styled from "styled-components";
import {
  generateErrorRatioQuery,
  generateLatencyQuery,
  generateRequestRateQuery,
  getCalledByErrorRatio,
  getCalledByRequestRate,
} from "../../../queries";
import { DatePicker } from "../DatePicker";
import { pxToEm } from "../../utils";
import { Button } from "../Button";
import { Refresh } from "./Refresh";
import { useContext } from "react";
import { useSnapshot } from "valtio";
import { GlobalLoadingContext, GraphContext } from "../../state";
import { Toggle } from "../Toggle";
import { useHandler } from "../../hooks";
import { TimeRange } from "fiberplane-charts";

type Props = {
  functionName: string;
  moduleName?: string;
};

export function FunctionCharts(props: Props) {
  const { functionName, moduleName } = props;

  const requestRateQuery = generateRequestRateQuery(functionName, moduleName);
  const errorRatioQuery = generateErrorRatioQuery(functionName, moduleName);
  const latencyQuery = generateLatencyQuery(functionName, moduleName);

  const calledByRequestQuery = getCalledByRequestRate(functionName);
  const calledByErrorRatioQuery = getCalledByErrorRatio(functionName);
  const state = useContext(GraphContext);
  const { showingQuery, timeRange } = useSnapshot(state);
  const loadingState = useContext(GlobalLoadingContext);
  const { loading } = useSnapshot(loadingState);
  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = timeRange;
  });

  return (
    <div>
      <TopSection>
        <Title>
          Live metrics for <FunctionName>{functionName}</FunctionName>
        </Title>
        <Controls>
          <ToggleContainer>
            <span>Showing PromQL</span>
            <Toggle
              onChange={(on) => {
                state.showingQuery = on;
              }}
              on={showingQuery}
            />
          </ToggleContainer>
          <DatePicker timeRange={timeRange} onChange={setTimeRange} />
          <StyledButton
            buttonStyle="secondary"
            disabled={loading}
            onClick={() => {
              Object.values(state.graphs).forEach((graph) => {
                graph.loading = true;
              });
            }}
          >
            <Refresh />
          </StyledButton>
        </Controls>
      </TopSection>
      <MainContent>
        <Container>
          <ChartContainer>
            <FunctionChart
              title="Request Rate"
              query={requestRateQuery}
              key="request_rate"
              id="request_rate"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Error Ratio"
              query={errorRatioQuery}
              key="error_ratio"
              id="error_ratio"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Latency (95th and 99th Percentile)"
              description="This shows the 99th and 95th percentile latency or response time for the given function.\n\nFor example, if the 99th percentile latency is 500 milliseconds, that means that 99% of calls to the function are handled within 500ms or less."
              query={latencyQuery}
              key="latency_query"
              id="latency_query"
            />
          </ChartContainer>
        </Container>
        <hr />
        <h5>"Called by" metrics</h5>
        <hr />
        <Container>
          <ChartContainer>
            <FunctionChart
              title="Request Rate"
              query={calledByRequestQuery}
              key="request_rate"
              id="called_by_request_rate"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Error Ratio"
              query={calledByErrorRatioQuery}
              key="error_ratio"
              id="called_by_error_ratio"
            />
          </ChartContainer>
        </Container>
      </MainContent>
    </div>
  );
}

const TopSection = styled.div`
  position: sticky;
  display: grid;
  grid-template-columns: auto max-content;
  padding: ${pxToEm(10)};
  border-bottom: 1px solid var(--vscode-menu-border, transparent);
  align-items: center;
  z-index: 1;
`;

const Title = styled.h1`
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 1.5385em; // 20px with 13px base
  line-height: 1.75; // 35px
  margin: 0;
  padding: 0;
`;

const Controls = styled.div`
  display: grid;
  height: fit-content;
  grid-template-columns: repeat(3, max-content);
  gap: ${pxToEm(20)};
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${pxToEm(20)};
  font: ${({ theme }) => theme.fontStudioBodyCopySmallShortHand};
`;

const StyledButton = styled(Button)`
  border-radius: ${pxToEm(8)};
`;

const FunctionName = styled.code`
  font-size: inherit;
`;

const MainContent = styled.div`
  padding: ${pxToEm(20)};
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${pxToEm(30)};
  width: 100%;
`;

const ChartContainer = styled.div`
  height: 100%;
`;
