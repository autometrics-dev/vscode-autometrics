import * as React from "react";
import { TimeRange, Timestamp } from "fiberplane-charts";
import { useHandler } from "../../hooks";
import { MonthTable } from "./MonthTable";
import styled, { css } from "styled-components";
import { Button } from "../Button";
import { pxToEm, validateTimeRange } from "../../utils";
import { FormEvent, useRef, useState } from "react";
import { DatePickerForm } from "./DatePickerForm";

type Props = {
  timeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePickerContent(props: Props) {
  const { onChange, timeRange } = props;

  const { from, to } = timeRange;

  const [draftFrom, setDraftFrom] = useState<Timestamp>(from);
  const [draftTo, setDraftTo] = useState<Timestamp>(to);

  const [key, setKey] = useState<number>(0);

  // const updateDraftFrom = (time: Timestamp) => {
  //   setKey(key + 1);
  //   setStart(time);
  // };

  // const setEndTime = (time: Timestamp) => {
  //   setKey(key + 1);
  //   setEnd(time);
  // };

  return (
    <Section>
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
  );
}

const Section = styled.div`
  width: min-content;
  padding: 16px;
  box-sizing: border-box;
  display: grid;
  gap: ${pxToEm(20)};
  border: 1px solid var(--vscode-dropdown-border, transparent);
  background: var(--vscode-dropdown-background, transparent);
  color: var(--vscode-dropdown-foreground, inherit);
`;

const HeaderText = styled.div(
  ({ theme }) => css`
    flex: 1;
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
  `,
);
