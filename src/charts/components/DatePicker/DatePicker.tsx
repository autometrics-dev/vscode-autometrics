import { TimeRange } from "fiberplane-charts";
import { Button } from "../Button";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { DatePickerContent } from "./DatePickerContent";
import { useHandler } from "../../hooks";
import { Clock } from "./Clock";
import { CaretDown } from "./CaretDown";
import { pxToEm } from "../../utils";
import { FlexibleTimeRange } from "../../../types";
import { formatDuration } from "../../../utils";
import { useFloating, useMergeRefs } from "@floating-ui/react";

type Props = {
  timeRange: FlexibleTimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePicker(props: Props) {
  const [opened, setOpened] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const { refs, floatingStyles } = useFloating();
  const handler = useHandler((timeRange: FlexibleTimeRange) => {
    setOpened(false);

    props.onChange({
      ...timeRange,
    });
  });

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const anchor = refs.reference.current as HTMLDivElement;
      if (!anchor) {
        return;
      }

      const floating = refs.floating.current;
      if (
        anchor.contains(event.target as Node) ||
        floating?.contains(event.target as Node)
      ) {
        return;
      }

      setOpened(false);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [refs]);

  return (
    <>
      <StyledButton
        buttonStyle="secondary"
        onClick={() => setOpened(!opened)}
        ref={refs.setReference}
      >
        <Clock />
        {formatDuration(props.timeRange)}
        <CaretDown />
      </StyledButton>
      {opened && (
        <Content ref={refs.setFloating} style={floatingStyles}>
          <DatePickerContent timeRange={props.timeRange} onChange={handler} />
        </Content>
      )}
    </>
  );
}

const Content = styled.div`
  position: absolute;
  z-index: 1;
  /* transform: translateY(${pxToEm(5)}); */
`;

const StyledButton = styled(Button)`
  background: var(--vscode-editorWidget-background, transparent);
  color: var(--vscode-editorWidget-foreground, transparent);
  border: 1px solid var(--vscode-editorWidget-border, transparent);
  display: flex;
  align-items: center;
  gap: ${pxToEm(10)};
  padding: ${pxToEm(10)};
  border-radius: ${pxToEm(8)};
  width: fit-content;

  &:hover {
    background: var(--vscode-editorWidget-foreground, transparent);
    color: var(--vscode-editorWidget-background, transparent);    
  }
`;
