import styled, { css } from "styled-components";

type Props = {
  on: boolean;
  className?: string;
  onChange: (on: boolean) => void;
  tabIndex?: number;
};

type ToggleProps = {
  "aria-checked": "true" | "false";
};

const ToggleContainer = styled.div<ToggleProps>`
  display: flex;
  border-radius: 10px;
  cursor: pointer;
  box-sizing: border-box;
  padding: 1px;
  height: 20px;
  width: 32px;
  background-color: var(${({ "aria-checked": on }) =>
    on === "true"
      ? "--vscode-checkbox-background"
      : "--vscode-checkbox-selectBackground"}, transparent);
  border: 1px solid var(--vscode-checkbox-border, transparent);
  transition: background 0.1s ease-in-out;
  transition-property: background, border-color;
  position: relative;

  &:focus {
    outline: ${(props) => props.theme.effectFocusOutline};
  }

  &:focus-visible {
    border-color: var(--vscode-checkbox-selectBorder, ${(props) =>
      props.theme.colorPrimary600});
  }
`;

const Dot = styled.div<ToggleProps>(
  ({ "aria-checked": on, theme }) => css`
    background: var(--vscode-checkbox-foreground, ${theme.colorBackground});
    border-radius: ${theme.borderRadiusRound};
    border: 1px solid var(--vscode-checkbox-border, transparent);
    display: inline-block;
    height: 16px;
    width: 16px;

    position: absolute;
    transition: left 0.15s ease-in-out;
    transition-property: left, width;
    left: ${on === "true" ? "12px" : "2px"};
    filter: ${theme.effectShadowMainFilter};

    /* Stylelint doesn't like this type of selectors and wants a newline in the middle */
    /* stylelint-disable-next-line rule-empty-line-before */
    ${ToggleContainer}[aria-checked="true"]:hover & {
      left: 9px;
      width: 18px;
      transform-origin: right center;
    }

    /* Stylelint doesn't like this type of selectors and wants a newline in the middle */
    /* stylelint-disable-next-line rule-empty-line-before */
    ${ToggleContainer}[aria-checked="false"]:hover & {
      width: 18px;
      transform-origin: left center;
    }
  `,
);

export function Toggle({
  className,
  on,
  onChange,
  tabIndex = 0,
}: Props): JSX.Element {
  const toggle = () => onChange(!on);
  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case " ":
      case "Enter":
        toggle();
        break;

      case "ArrowLeft":
        onChange(false);
        break;

      case "ArrowRight":
        onChange(true);
        break;
    }
  };

  const ariaChecked = on ? "true" : "false";
  return (
    <ToggleContainer
      className={className}
      data-testid="toggle"
      onClick={toggle}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role="switch"
      aria-checked={ariaChecked}
    >
      <Dot aria-checked={ariaChecked} />
    </ToggleContainer>
  );
}
