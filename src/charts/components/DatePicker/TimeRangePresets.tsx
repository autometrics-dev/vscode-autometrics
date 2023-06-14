import styled, { css } from "styled-components";
import { pxToEm } from "../../utils";
import { FlexibleTimeRange } from "../../../types";

type Option = {
  label: string;
  value: string;
};

const options: Array<Option> = [
  {
    label: "Last 5 minutes",
    value: "5 minutes",
  },
  {
    label: "Last 15 minutes",
    value: "15 minutes",
  },
  {
    label: "Last 30 minutes",
    value: "30 minutes",
  },
  {
    label: "Last 1 hour",
    value: "1 hour",
  },
  {
    label: "Last 3 hours",
    value: "3 hours",
  },
  {
    label: "Last 6 hours",
    value: "6 hours",
  },
  {
    label: "Last 12 hours",
    value: "12 hours",
  },
  {
    label: "Last 24 hours",
    value: "24 hours",
  },
  {
    label: "Last 2 days",
    value: "2 days",
  },
  {
    label: "Last 7 days",
    value: "7 days",
  },
  {
    label: "Last 30 days",
    value: "30 days",
  },
  {
    label: "Last 90 days",
    value: "90 days",
  },
  {
    label: "Last 6 months",
    value: "6 months",
  },
  {
    label: "Last 1 year",
    value: "1 year",
  },
  {
    label: "Last 2 years",
    value: "2 years",
  },
  {
    label: "Last 5 years",
    value: "5 years",
  },
  {
    label: "Last 10 years",
    value: "10 years",
  },
  {
    label: "Last 20 years",
    value: "20 years",
  },
];

type Props = {
  onChange: (timeRange: FlexibleTimeRange) => void;
};

export function TimeRangePresets(props: Props) {
  const { onChange } = props;

  return (
    <Container>
      <HeaderText>Time range</HeaderText>
      <OptionsList>
        {options.map((option) => (
          <TimeOption
            key={option.label}
            onClick={() => {
              onChange({
                type: "relative",
                from: `now-${option.value}`,
                to: "now",
              });
            }}
          >
            {option.label}
          </TimeOption>
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
  padding: ${pxToEm(10)} ${pxToEm(10)} ${pxToEm(10)} 0;
  overflow: auto;
`;

const TimeOption = styled.button`
  font-size: ${pxToEm(12)};  
  display: block;
  color: var(--vscode-menu-foreground);
  background-color: var(--vscode-menu-background);
  text-decoration: none;
  line-height: ${(21 / 12).toFixed(2)};
  padding: 0 ${pxToEm(10)};
  cursor: pointer;
  border: 0;
  text-align: left;


  &:hover {
    color: var(--vscode-menu-selectionForeground);
    background: var(--vscode-menu-selectionBackground);
  }
`;
