import * as React from "react";
import { TimeRange, Timestamp } from "fiberplane-charts";
import { useHandler } from "../../hooks";
import { MonthTable } from "./MonthTable";
import styled, { css } from "styled-components";
import { Button } from "../Button";
import { pxToEm, validateTimeRange } from "../../utils";
import { FormEvent, useRef, useState } from "react";

type Props = {
  timeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePickerContent(props: Props) {
  const { onChange, timeRange } = props;

  const { from, to } = timeRange;

  const [start, setStart] = useState<Timestamp>(from);
  const [end, setEnd] = useState<Timestamp>(to);

  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  const [startError, setStartError] = useState<undefined | string>();
  const [endError, setEndError] = useState<undefined | string>();
  const [globalError, setGlobalError] = useState<undefined | string>();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLButtonElement>,
  ): false | void => {
    event.preventDefault();

    // Refs shouldn't be null, but it they are there isn't much to validate
    if (!startRef.current || !endRef.current) {
      return;
    }

    const { errors, values } = validateTimeRange({
      from: startRef.current.value,
      to: endRef.current.value,
    });

    const hasErrors =
      Object.values(errors).findIndex((value) => !!value) !== -1;

    // Update state
    setStartError(errors.from);
    setEndError(errors.to);
    setGlobalError(errors.global);

    if (hasErrors) {
      return false;
    }

    onChange(values);
  };

  React.useLayoutEffect(() => {
    startRef.current?.focus();
  }, [startRef]);

  const handler: React.KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (event.target !== startRef.current && event.target !== endRef.current) {
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.stopPropagation();
  };
  return (
    <Section>
      <MonthTable
        setStartTime={setStart}
        setEndTime={setEnd}
        startTime={start}
        endTime={end}
      />
      <Form onSubmit={handleSubmit} onKeyDown={handler}>
        <FormContent>
          <FormHeader>Absolute time range</FormHeader>
          {globalError && <FormErrorMessage>{globalError}</FormErrorMessage>}
          <div>
            <input
              placeholder="From"
              type="text"
              name="startTime"
              className={startError || globalError ? "error" : ""}
              aria-invalid={startError || globalError ? true : undefined}
              onChange={(event) => {
                const { errors, values } = validateTimeRange({
                  from: event.target.value,
                  to: end,
                });
                const hasErrors =
                  Object.values(errors).filter((value) => !!value).length === 0;
                if (hasErrors) {
                  setStart(values.from);
                }
              }}
              key={start}
              defaultValue={start}
              ref={startRef}
            />
            {startError && <FormErrorMessage>{startError}</FormErrorMessage>}
          </div>
          <div>
            <input
              placeholder="To"
              type="text"
              key={end}
              defaultValue={end}
              className={endError || globalError ? "error" : ""}
              name="endTime"
              aria-invalid={endError || globalError ? true : undefined}
              onChange={(event) => {
                const { errors, values } = validateTimeRange({
                  to: event.target.value,
                  from: start,
                });
                const hasErrors =
                  Object.values(errors).filter((value) => !!value).length === 0;
                if (hasErrors) {
                  setEnd(values.to);
                }
              }}
              ref={endRef}
            />
            {endError && <FormErrorMessage>{endError}</FormErrorMessage>}
          </div>
          <ApplyButton
            type="submit"
            onKeyUp={(event: React.KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === " " || event.key === "Enter") {
                event.stopPropagation();
                handleSubmit(event);
              }
            }}
          >
            Apply
          </ApplyButton>
        </FormContent>
      </Form>
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

const ApplyButton = styled(Button)`
  display: block;
  width: 100%;
`;

export const Form = styled.form`
  display: contents;
`;

export const FormHeader = styled.div(
  ({ theme }) => css`
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
    padding: 0 6px;
  `,
);

export const FormContent = styled.div`
  display: grid;
  /* flex-direction: column; */
  gap: ${pxToEm(20)};
  /* padding: 0 8px; */
`;

export const FormErrorMessage = styled(FormHeader)`
  background: var(--vscode-inputValidation-errorBackground, #f2dede);
  border-color: var(--vscode-inputValidation-errorBorder, #a1260d);
  color: var(--vscode-foreground, #a1260d);
`;
