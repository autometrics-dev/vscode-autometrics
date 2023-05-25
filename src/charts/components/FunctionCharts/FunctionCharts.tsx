import { FunctionChart } from "./FunctionChart";
import { TimeRangeProps } from "../types";
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

type Props = TimeRangeProps & {
  functionName: string;
  moduleName?: string;
};

export function FunctionCharts(props: Props) {
  const { functionName, moduleName, timeRange, setTimeRange } = props;

  const requestRateQuery = generateRequestRateQuery(functionName, moduleName);
  const errorRatioQuery = generateErrorRatioQuery(functionName, moduleName);
  const latencyQuery = generateLatencyQuery(functionName, moduleName);

  const calledByRequestQuery = getCalledByRequestRate(functionName);
  const calledByErrorRatioQuery = getCalledByErrorRatio(functionName);

  return (
    <div>
      <TopSection>
        <Title>
          Live metrics for <FunctionName>{functionName}</FunctionName>
        </Title>
        <Controls>
          <DatePicker timeRange={timeRange} onChange={setTimeRange} />
        </Controls>
      </TopSection>
      <MainContent>
        <Container>
          <ChartContainer>
            <FunctionChart
              title="Request Rate"
              query={requestRateQuery}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              key="request_rate"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Error Ratio"
              query={errorRatioQuery}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              key="error_ratio"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Latency (95th and 99th Percentile)"
              description="This shows the 99th and 95th percentile latency or response time for the given function.\n\nFor example, if the 99th percentile latency is 500 milliseconds, that means that 99% of calls to the function are handled within 500ms or less."
              query={latencyQuery}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              key="latency_query"
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
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              key="request_rate"
            />
          </ChartContainer>
          <ChartContainer>
            <FunctionChart
              title="Error Ratio"
              query={calledByErrorRatioQuery}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              key="error_ratio"
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
  gap: 30px;
  width: 100%;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-rows: min-content auto 100px;
  gap: 1.692em; // 22px on 13px base;
  height: 100%;
`;
