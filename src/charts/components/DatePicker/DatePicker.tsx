import { TimeRange } from "fiberplane-charts";
import { Button } from "../Button";
import styled from "styled-components";
import { useState } from "react";
import { DatePickerContent } from "./DatePickerContent";
import { useHandler } from "../../hooks";

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
        {props.timeRange.from} - {props.timeRange.to}
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
`;

const StyledButton = styled(Button)`
  background: var(--vscode-editorWidget-background, transparent);
  color: var(--vscode-editorWidget-foreground, transparent);
  border: 1px solid var(--vscode-editorWidget-border, transparent);

  &:hover {
    background: var(--vscode-editorWidget-border, transparent);
  }
`;
