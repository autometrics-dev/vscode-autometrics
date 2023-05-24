import { TimeRange } from "fiberplane-charts";
import { Button } from "../Button";
import styled from "styled-components";
import { useState } from "react";
import { DatePickerContent } from "./DatePickerContent";
import { useHandler } from "../../hooks";
import { Clock } from "./Clock";
import { CaretDown } from "./CaretDown";
import { pxToEm } from "../../utils";

type Props = {
  timeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePicker(props: Props) {
  const [opened, setOpened] = useState(false);

  const handler = useHandler((timeRange: TimeRange) => {
    setOpened(false);
    props.onChange(timeRange);
  });

  return (
    <>
      <StyledButton buttonStyle="secondary" onClick={() => setOpened(!opened)}>
        <Clock />
        {props.timeRange.from} - {props.timeRange.to}
        <CaretDown />
      </StyledButton>
      {opened && (
        <Content>
          <DatePickerContent timeRange={props.timeRange} onChange={handler} />
        </Content>
      )}
    </>
  );
}

const Content = styled.div`
  position: absolute;
  z-index: 1;
  transform: translateY(${pxToEm(5)});
`;

const StyledButton = styled(Button)`
  background: var(--vscode-editorWidget-background, transparent);
  color: var(--vscode-editorWidget-foreground, transparent);
  border: 1px solid var(--vscode-editorWidget-border, transparent);
  /* background: var(--vscode-dropdown-background, transparent);
  color: var(--vscode-dropdown-foreground, transparent);
  border: 1px solid var(--vscode-dropdown-border, transparent); */
  display: flex;
  align-items: center;
  gap: ${pxToEm(10)};
  padding: ${pxToEm(10)};
  border-radius: ${pxToEm(8)};

  &:hover {
    background: var(--vscode-editorWidget-foreground, transparent);
    color: var(--vscode-editorWidget-background, transparent);    
    /* background: var(--vscode-editorWidget-border, transparent); */
  }
`;
