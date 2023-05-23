import styled, { css } from "styled-components";
import { pxToEm } from "../../utils";

type Option = {
  label: string;
  value: number;
};

const options: Array<Option> = [
  {
    label: "Last 5 minutes",
    value: 5 * 60 * 1000,
  },
  {
    label: "Last 15 minutes",
    value: 15 * 60 * 1000,
  },
  {
    label: "Last 30 minutes",
    value: 30 * 60 * 1000,
  },
  {
    label: "Last 1 hour",
    value: 60 * 60 * 1000,
  },
  {
    label: "Last 3 hours",
    value: 3 * 60 * 60 * 1000,
  },
  {
    label: "Last 6 hours",
    value: 6 * 60 * 60 * 1000,
  },
  {
    label: "Last 12 hours",
    value: 12 * 60 * 60 * 1000,
  },
  {
    label: "Last 24 hours",
    value: 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 2 days",
    value: 2 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 7 days",
    value: 7 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 30 days",
    value: 30 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 90 days",
    value: 90 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 6 months",
    value: 6 * 30 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 1 year",
    value: 365 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 2 years",
    value: 2 * 365 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 5 years",
    value: 5 * 365 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 10 years",
    value: 10 * 365 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 20 years",
    value: 20 * 365 * 24 * 60 * 60 * 1000,
  },
];

export function TimeRangePresets() {
  return (
    <Container>
      <HeaderText>Time range</HeaderText>
      <OptionsList>
        {options.map((option) => (
          <TimeOption key={option.label}>{option.label}</TimeOption>
        ))}
      </OptionsList>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  gap: ${pxToEm(10)};
  grid-template-rows: ${pxToEm(18)} auto;
  height: 442px;
`;

const HeaderText = styled.div(
  ({ theme }) => css`
    flex: 1;
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
    padding: 0 ${pxToEm(4)};
  `,
);

const OptionsList = styled.div`
  display: flex;
  gap: ${pxToEm(10)};
  flex-direction: column;
  padding: ${pxToEm(10)} 0;
  overflow: auto;
`;

const TimeOption = styled.a`
  font-size: ${pxToEm(12)};  
  display: block;
  color: var(--vscode-menu-foreground);
  background-color: var(--vscode-menu-background);
  text-decoration: none;
  line-height: ${(21 / 12).toFixed(2)};
  padding: 0 ${pxToEm(10)};


  &:hover {
    color: var(--vscode-menu-selectionForeground);
    background: var(--vscode-menu-selectionBackground);
  }
`;
