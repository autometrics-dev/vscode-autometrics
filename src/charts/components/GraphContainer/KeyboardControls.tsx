import { useRef, useState } from "react";
import { Tooltip } from "../Tooltip";
import { Keyboard } from "./Keyboard";
import styled from "styled-components";
import { pxToEm } from "../../utils";

export function KeyboardControls() {
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      {hover && ref.current && (
        <StyledTooltip anchor={ref.current} offset={10} alignment="end">
          <Heading>Keyboard controls</Heading>
          <div>
            On a graph you can change the time range using keyboard and mouse
          </div>
          <ControlOption>
            <div>Drag time range:</div>
            <KeyboardCombination>
              <Key>Shift</Key>
              <Key>Drag</Key>
            </KeyboardCombination>
          </ControlOption>
          <ControlOption>
            <div>Zoom time range:</div>
            <KeyboardCombination>
              <Key>Cmd</Key>
              <Key>Select</Key>
            </KeyboardCombination>
          </ControlOption>
        </StyledTooltip>
      )}
      <Container
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Keyboard />
      </Container>
    </>
  );
}

const StyledTooltip = styled(Tooltip)`
  width: ${pxToEm(270)};
  padding: ${pxToEm(20)};
  border-radius: ${pxToEm(4)};
  box-shadow: 0px 4px 4px 0px var(--vscode-widget-shadow, transparent);
  border: 1px solid var(--vscode-menu-border, transparent);
  display: grid;
  gap: 10px;
`;

const Container = styled.div`
  border: 1px solid var(--vscode-menu-border, transparent);
  box-shadow: 0px 4px 4px 0px var(--vscode-widget-shadow, transparent);
  background: var(--vscode-menu-background, transparent);
  padding: ${pxToEm(5)} ${pxToEm(5)} ${pxToEm(4)};
  color: var(--vscode-foreground);
  border-radius: ${pxToEm(6)};

  &:hover {
    background: var(--vscode-menubar-selectionBackground, transparent);
    color: var(--vscode-menubar-selectionForeground, transparent);
  }
`;

const Heading = styled.h2`
  margin: 0;
  padding: 0;
`;

const ControlOption = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: ${pxToEm(10)};
`;

const KeyboardCombination = styled.div`
  display: flex;
  gap: ${pxToEm(4)};
`;

const Key = styled.code`
  border: 1px solid var(--vscode-menu-border, transparent);
  background: var(--vscode-badge-background, transparent);
  color: var(--vscode-badge-foreground, currentColor);
  padding: ${pxToEm(5)} ${pxToEm(10)};
  border-radius: ${pxToEm(4)};
`;
