import { memo, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { Day } from "./Day";
import { Timestamp } from "fiberplane-charts";
import { getDateParts, pxToEm, timestampToDate } from "../../utils";
import { Button } from "../Button";
import CaretLeft from "./CaretLeft";
import CaretRight from "./CaretRight";

console.log("CaretLeft", CaretLeft);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const START_DAY_OFFSET = 1;

type Props = {
  startTime: Timestamp;
  endTime?: Timestamp;
  setStartTime: (startTime: Timestamp) => void;
  setEndTime?: (endTime: Timestamp) => void;
  className?: string;
};

export const MonthTable = memo(function MonthTable(props: Props) {
  // Holds the first date the user clicks
  const [selectedDate, setSelectedDate] = useState<null | Date>(null);

  // Holds the date which the user is hovering over
  const [hoverDate, setHoverDate] = useState<null | Date>(null);

  // Is used to change the currently displayed month
  const [monthOffset, setMonthOffset] = useState(0);

  // Create a new date + set it to the month we want to display (using the monthOffset)
  const offsetDate = timestampToDate(props.startTime);
  offsetDate.setMonth(offsetDate.getMonth() + monthOffset);

  const monthTimestamp = offsetDate.toISOString();

  const currentMonth = offsetDate.getMonth();
  const year = offsetDate.getFullYear();

  // Create dates from the timestamps so we can check things like day/month/year
  const startDate = timestampToDate(props.startTime);
  const endDate = timestampToDate(props.endTime ?? props.startTime);

  let startParts = getDateParts(selectedDate || startDate);

  const hoverParts = hoverDate && getDateParts(hoverDate);
  // Backwards happens when a user has clicked on a date and is
  // hovering over a date that is before that one.
  const backwards = hoverParts && hoverParts.timestamp < startParts.timestamp;

  let endParts = hoverParts || getDateParts(endDate);

  // If we're in backwards mode: swap start & end
  if (backwards && hoverParts) {
    endParts = startParts;
    startParts = hoverParts;
  }

  // Create an array of weeks
  const weeks = useMemo(() => getMonthWeeks(monthTimestamp), [monthTimestamp]);

  const onClick = (day: Date) => {
    // No end time, so instead of creating a range we set the start time
    if (!props.endTime) {
      props.setStartTime(day.toISOString());
      return;
    }

    if (!selectedDate) {
      setSelectedDate(day);
      setHoverDate(day);
      return;
    }

    const dayParts = getDateParts(day);
    const startDate = timestampToDate(
      backwards ? dayParts.timestamp : startParts.timestamp,
    );
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    props.setStartTime(startDate.toISOString());

    if (props.setEndTime) {
      const endDate = timestampToDate(
        backwards ? endParts.timestamp : dayParts.timestamp,
      );
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
      endDate.setMilliseconds(999);
      props.setEndTime(endDate.toISOString());
    }

    setSelectedDate(null);
    setMonthOffset(0);
    setHoverDate(null);
  };

  const onMouseOver = (day: Date) => {
    if (selectedDate) {
      setHoverDate(day);
    }
  };

  return (
    <Container>
      <Header className={props.className}>
        <HeaderText>
          {MONTHS[currentMonth]} {year}
        </HeaderText>
        <Controls>
          <IconButton
            buttonStyle="secondary"
            onClick={() => setMonthOffset(monthOffset - 1)}
          >
            <CaretLeft />
          </IconButton>
          <IconButton
            buttonStyle="secondary"
            onClick={() => setMonthOffset(monthOffset + 1)}
          >
            <CaretRight />
          </IconButton>
        </Controls>
      </Header>

      <Table role="presentation">
        <thead aria-hidden="true">
          <tr>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
            <th>S</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr>
              {week.map((day) => (
                <Day
                  day={day}
                  currentMonth={currentMonth}
                  onClick={onClick}
                  onMouseOver={onMouseOver}
                  startParts={startParts}
                  endParts={endParts}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
});

function getMonthWeeks(monthTimestamp: Timestamp): Date[][] {
  const date = timestampToDate(monthTimestamp);

  // Go to the first
  date.setDate(1);

  const dayIndex = date.getDay();

  // Calculate the number of days we need to pad at the beginning
  const startPadding = dayIndex - START_DAY_OFFSET;

  // Create a date object that points to the last day
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // Get the number of days we're going to render at minimum
  const intermediateDayCount = lastDate.getDate() + startPadding;

  // Get the number weeks this is and round up
  const weekCount = Math.ceil(intermediateDayCount / 7);

  // Create an array with date objects
  const weeks: Date[][] = [];

  // move to start date/day
  date.setDate(1 - startPadding);

  // Store the date
  let day = date;

  // Repeat for the nr of weeks we want to render
  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
    const week = [];
    // Loop until we have 7 days
    while (week.length < 7) {
      week.push(day);
      day = new Date(day.getTime());
      day.setDate(day.getDate() + 1);
    }

    // Push the week to the weeks array
    weeks.push(week);
  }

  return weeks;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${pxToEm(20)};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderText = styled.div(
  ({ theme }) => css`
    flex: 1;
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
  `,
);

const Controls = styled.div`
  display: flex;
`;

const Table = styled.table(
  ({ theme }) => css`
    border-collapse: collapse;
    font-size: inherit;

    tbody {
      display: flex;
      flex-direction: column;
      grid-row-gap: ${pxToEm(4)};
    }

    tr {
      display: flex;
    }

    th,
    td {
      display: inline-block;
      text-transform: uppercase;
      text-align: center;
      font: ${theme.fontStudioBodyCopySmallShortHand};
      letter-spacing: ${theme.fontStudioBodyCopySmallLetterSpacing};
      padding: 0;
    }

    th {
      color: var(--vscode-editorHoverWidget-foreground);
      width:  ${pxToEm(28)};
      height:  ${pxToEm(28)};
    }
  `,
);

const IconButton = styled(Button)`
  width:  ${pxToEm(20)};
  height:  ${pxToEm(20)};
  padding: 0;
`;
