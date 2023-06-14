import { TimeRange, Timestamp } from "fiberplane-charts";
import { MonthTable } from "./MonthTable";
import styled, { css } from "styled-components";
import { pxToEm } from "../../utils";
import { useMemo, useState } from "react";
import { DatePickerForm } from "./DatePickerForm";
import { TimeRangePresets } from "./TimeRangePresets";
import { FlexibleTimeRange } from "../../../types";
import { relativeToAbsoluteTimeRange } from "../../../utils";

type Props = {
  timeRange: FlexibleTimeRange;
  onChange: (timeRange: FlexibleTimeRange) => void;
};

export function DatePickerContent(props: Props) {
  const { onChange, timeRange } = props;
  const [draft, setDraft] = useState<FlexibleTimeRange>(timeRange);
  const absoluteTimeRange = useMemo(() => {
    if (draft.type === "absolute") {
      return draft;
    }

    return relativeToAbsoluteTimeRange(draft);
  }, [draft]);

  return (
    <Container>
      <Section>
        <Header>Absolute time range</Header>
        <MonthTable
          startTime={absoluteTimeRange.from}
          endTime={absoluteTimeRange.to}
          updateTimeRange={setDraft}
        />
        <DatePickerForm
          from={draft.from}
          to={draft.to}
          onChange={(timeRange) => onChange({ type: "absolute", ...timeRange })}
          updateDraft={setDraft}
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
