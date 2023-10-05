import * as React from "react";
import { TimeRange, Timestamp } from "@fiberplane/fiberplane-charts";
import styled, { css } from "styled-components";

import { pxToEm, validateTimeRange } from "../../utils";
import { Button } from "../Button";
import { FlexibleTimeRange } from "../../../types";

type Props = {
  from: Timestamp;
  to: Timestamp;
  updateDraft: (time: FlexibleTimeRange) => void;
  onChange: (timeRange: TimeRange) => void;
};

export function DatePickerForm(props: Props) {
  const { from, to, onChange, updateDraft } = props;
  const fromRef = React.useRef<HTMLInputElement | null>(null);
  const toRef = React.useRef<HTMLInputElement | null>(null);

  const [fromError, setFromError] = React.useState<undefined | string>();
  const [toError, setToError] = React.useState<undefined | string>();
  const [globalError, setGlobalError] = React.useState<undefined | string>();

  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLButtonElement>,
  ): false | void => {
    event.preventDefault();

    // Refs shouldn't be null, but it they are there isn't much to validate
    if (!fromRef.current || !toRef.current) {
      return;
    }

    const { errors, values } = validateTimeRange({
      from: fromRef.current.value,
      to: toRef.current.value,
    });

    const hasErrors =
      Object.values(errors).findIndex((value) => !!value) !== -1;

    // Update state
    setFromError(errors.from);
    setToError(errors.to);
    setGlobalError(errors.global);

    if (hasErrors) {
      return false;
    }

    onChange(values);
  };

  React.useLayoutEffect(() => {
    fromRef.current?.focus();
  }, [fromRef]);

  const handler: React.KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (event.target !== fromRef.current && event.target !== toRef.current) {
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.stopPropagation();
  };

  React.useEffect(() => {
    if (!fromRef.current) {
      return;
    }

    if (fromRef.current.value !== from) {
      fromRef.current.value = from;
    }
  }, [from]);

  React.useEffect(() => {
    if (!toRef.current) {
      return;
    }

    if (toRef.current.value !== to) {
      toRef.current.value = to;
    }
  }, [to]);

  return (
    <Form onSubmit={handleSubmit} onKeyDown={handler}>
      <FormContent>
        {globalError && <FormErrorMessage>{globalError}</FormErrorMessage>}
        <FormDateRange>
          <div>
            <input
              placeholder="From"
              type="text"
              name="fromTime"
              className={fromError || globalError ? "error" : ""}
              aria-invalid={fromError || globalError ? true : undefined}
              onChange={(event) => {
                const { errors, values } = validateTimeRange({
                  from: event.target.value,
                  to: to,
                });
                const hasErrors =
                  Object.values(errors).filter((value) => !!value).length === 0;
                if (hasErrors) {
                  updateDraft(values);
                }
              }}
              defaultValue={from}
              ref={fromRef}
            />
            {fromError && <FormErrorMessage>{fromError}</FormErrorMessage>}
          </div>
          <div>
            <input
              placeholder="To"
              type="text"
              defaultValue={to}
              className={toError || globalError ? "error" : ""}
              name="toTime"
              aria-invalid={toError || globalError ? true : undefined}
              onChange={(event) => {
                const { errors, values } = validateTimeRange({
                  to: event.target.value,
                  from: from,
                });
                const hasErrors =
                  Object.values(errors).filter((value) => !!value).length === 0;
                if (hasErrors) {
                  updateDraft(values);
                }
              }}
              ref={toRef}
            />
            {toError && <FormErrorMessage>{toError}</FormErrorMessage>}
          </div>
        </FormDateRange>
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
  );
}

const ApplyButton = styled(Button)`
  display: block;
  width: 100%;
`;

export const Form = styled.form`
  display: contents;
`;

export const FormContent = styled.div`
  display: grid;
  gap: ${pxToEm(20)};
`;

export const FormDateRange = styled.div`
display: flex;
flex-direction: column;
gap: ${pxToEm(8)};
`;

export const FormErrorMessage = styled.div(
  ({ theme }) => css`
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
    padding: 0 6px;
    background: var(--vscode-inputValidation-errorBackground, #f2dede);
    border-color: var(--vscode-inputValidation-errorBorder, #a1260d);
    color: var(--vscode-foreground, #a1260d);
  `,
);
