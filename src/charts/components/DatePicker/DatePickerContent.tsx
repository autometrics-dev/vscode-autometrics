import { TimeRange, Timestamp } from "fiberplane-charts";
import { MonthTable } from "./MonthTable";
import styled, { css } from "styled-components";
import { pxToEm } from "../../utils";
import { useState } from "react";
import { DatePickerForm } from "./DatePickerForm";
import { TimeRangePresets } from "./TimeRangePresets";

type Props = {
  timeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePickerContent(props: Props) {
  const { onChange, timeRange } = props;

  const { from, to } = timeRange;

  const [draftFrom, setDraftFrom] = useState<Timestamp>(from);
  const [draftTo, setDraftTo] = useState<Timestamp>(to);

  return (
    <Container>
      <Section>
        <Header>Absolute time range</Header>

        <MonthTable
          setStartTime={setDraftFrom}
          setEndTime={setDraftTo}
          startTime={draftFrom}
          endTime={draftTo}
        />
        <DatePickerForm
          from={draftFrom}
          to={draftTo}
          onChange={onChange}
          updateDraftFrom={setDraftFrom}
          updateDraftTo={setDraftTo}
        />
      </Section>
      <Section>
        <TimeRangePresets onChange={onChange} />
      </Section>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  border: 1px solid var(--vscode-menu-border, transparent);
  background: var(--vscode-menu-background, transparent);
  color: var(--vscode-menu-foreground, inherit);
  border-radius: ${pxToEm(4)};
  box-shadow: 0px 4px 4px 0px var(--vscode-widget-shadow, transparent);
`;

const Section = styled.div`
  padding: 16px;
  box-sizing: border-box;
  display: grid;
  gap: ${pxToEm(20)};
`;

export const Header = styled.div(
  ({ theme }) => css`
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
    padding: 0 6px;
  `,
);
