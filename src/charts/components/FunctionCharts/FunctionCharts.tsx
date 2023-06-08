import { FunctionChart } from "./FunctionChart";
import styled from "styled-components";
import {
  generateErrorRatioQuery,
  generateLatencyQuery,
  generateRequestRateQuery,
  getCalledByErrorRatio,
  getCalledByRequestRate,
} from "../../../queries";
import { pxToEm } from "../../utils";
import { GraphContainer } from "../GraphContainer";

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

  return (
    <GraphContainer
      title={
        <>
          Live metrics for <FunctionName>{functionName}</FunctionName>
        </>
      }
    >
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
      <StyledLine />
      <SectionHeading>"Called by" metrics</SectionHeading>
      <StyledLine />
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
    </GraphContainer>
  );
}

const FunctionName = styled.code`
  font-size: inherit;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: ${pxToEm(20)} ${pxToEm(30)} ${pxToEm(20)} ${pxToEm(20)};
  gap: ${pxToEm(25)};
  width: 100%;
  box-sizing: border-box;
`;

const ChartContainer = styled.div`
  height: 100%;
`;

const StyledLine = styled.hr`
  padding: 0;
  margin: 0;
  border: none;
  height: 1px;
  background: var(--vscode-menu-border, transparent);
`;

const SectionHeading = styled.h5`
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: ${pxToEm(16)};
  line-height: ${35 / 16};
  margin: 0;
  padding: ${pxToEm(10)} ${pxToEm(30, 16)};
`;
