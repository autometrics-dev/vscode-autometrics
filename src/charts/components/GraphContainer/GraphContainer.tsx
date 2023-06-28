import styled from "styled-components";
import { pxToEm } from "../../utils";
import { Button } from "../Button";
import { Toggle } from "../Toggle";
import { useContext } from "react";
import { GlobalLoadingContext, GraphContext } from "../../state";
import { useSnapshot } from "valtio";
import { TimeRange } from "fiberplane-charts";
import { useHandler } from "../../hooks";
import { DatePicker } from "../DatePicker";
import { Refresh } from "./Refresh";
import { KeyboardControls } from "./KeyboardControls";

export function GraphContainer(props: {
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  const state = useContext(GraphContext);
  const { showingQuery, timeRange } = useSnapshot(state);
  const loadingState = useContext(GlobalLoadingContext);
  const { loading } = useSnapshot(loadingState);
  const setTimeRange = useHandler((timeRange: TimeRange) => {
    state.timeRange = { type: "absolute", ...timeRange };
  });

  return (
    <Container>
      <TopSection>
        <Title>{props.title}</Title>
        <Controls>
          <ToggleContainer>
            <span>Show query</span>
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
              // This way the time range will also appear new, triggering a refresh
              state.timeRange = { ...state.timeRange };
            }}
          >
            <Refresh />
          </StyledButton>
        </Controls>
      </TopSection>
      <Content>{props.children}</Content>
      <ControlsContainer>
        <KeyboardControls />
      </ControlsContainer>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: min-content auto;
  height: 100vh;
`;

const TopSection = styled.div`
  background: var(--vscode-menu-background, transparent);
  display: grid;
  grid-template-columns: auto max-content;
  padding: ${pxToEm(10)} ${pxToEm(30)};
  border-bottom: 1px solid var(--vscode-menu-border, transparent);
  align-items: center;
  z-index: 1;
`;

const Title = styled.h1`
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: ${pxToEm(20)}; // 20px with 13px base
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

  &[disabled] {
    opacity: 0.5;
    transition: opacity 0.15s ease-in-out;

  }
`;

const Content = styled.div`
  overflow: auto;
`;

const ControlsContainer = styled.div`
  position: sticky;
  bottom: 10px;
  right: 10px;
`;
