import styled, { css } from "styled-components";
import { DateParts, cancelEvent, getDateParts, pxToEm } from "../../utils";

type Props = {
  day: Date;
  currentMonth: number;
  onClick: (day: Date) => void;
  onMouseOver: (day: Date) => void;
  startParts: DateParts;
  endParts: DateParts;
};

export function Day({
  day,
  currentMonth,
  onClick,
  onMouseOver,
  startParts,
  endParts,
}: Props) {
  const dayParts = getDateParts(day);

  const isStartDay =
    dayParts.month === startParts.month &&
    dayParts.date === startParts.date &&
    dayParts.year === startParts.year;

  const isEndDay =
    dayParts.month === endParts.month &&
    dayParts.date === endParts.date &&
    dayParts.year === endParts.year;

  // You can only be between if you're not already start/end
  const isBetween =
    !isStartDay &&
    !isEndDay &&
    dayParts.timestamp > startParts.timestamp &&
    dayParts.timestamp < endParts.timestamp;

  const className = `${isStartDay || isEndDay ? "selected" : ""} ${
    isBetween ? "semi-selected" : ""
  }`;

  return (
    <DateItem
      tabIndex={-1}
      outside={day.getMonth() !== currentMonth}
      className={className}
      onClick={(event) => {
        cancelEvent(event);
        onClick(day);
      }}
      onMouseOver={() => onMouseOver(day)}
      isStartDay={isStartDay}
      isEndDay={isEndDay}
    >
      <StyledDay>
        {day.getDate().toLocaleString(undefined, {
          minimumIntegerDigits: 2,
        })}
      </StyledDay>
    </DateItem>
  );
}

const DateItem = styled.td<{
  outside: boolean;
  isStartDay: boolean;
  isEndDay: boolean;
}>(
  ({ theme, outside, isStartDay, isEndDay }) => css`
    text-align: center;
    cursor: pointer;
    opacity: ${outside ? "0.5" : "1.0"};
    

    &.selected ${StyledDay} {
      background: var(--vscode-dropdown-foreground);
      color: var(--vscode-dropdown-background);
    }

    &.selected + .semi-selected {
      position: relative;

      &::before {
        position: absolute;
        content: "";
        background: ${theme.colorBase300};
        top: 0;
        bottom: 0;
        left: -${pxToEm(10, 12)};
        width: ${pxToEm(10, 12)};
        z-index: 1;
      }
    }

    &.semi-selected + .selected {
      position: relative;

      &::before {
        position: absolute;
        content: "";
        background: ${theme.colorBase300};
        top: 0;
        bottom: 0;
        left: 0;
        width: 8px;
        z-index: 1;
      }
    }

    &.selected + .selected {
      position: relative;

      &::before {
        position: absolute;
        content: "";
        background: ${theme.colorBase300};
        top: 0;
        bottom: 0;
        left: -8px;
        width: 16px;
        z-index: 1;
      }
    }

    &.semi-selected {
      background: ${theme.colorBase300};
      color: ${theme.colorBase800};
    }

    &:hover ${StyledDay} {
      background: ${theme.colorBase400};
      color: ${theme.colorBase800};
    }

    ${
      isStartDay &&
      css`
      & {
        border-top-left-radius: ${theme.borderRadius600};
        border-bottom-left-radius: ${theme.borderRadius600};
      }
    `
    }

    ${
      isEndDay &&
      css`
      & {
        border-top-right-radius: ${theme.borderRadius600};
        border-bottom-right-radius: ${theme.borderRadius600};
      }
    `
    }
  `,
);

export const StyledDay = styled.span(
  ({ theme }) => css`
    z-index: 2;
    position: sticky;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius600};
    width: ${pxToEm(32, 12)};
    height: ${pxToEm(28, 12)};
    line-height: ${pxToEm(28, 12)};
  `,
);
