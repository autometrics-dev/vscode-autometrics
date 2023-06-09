import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type ButtonStyle = "primary" | "secondary";
type Props = {
  children: React.ReactNode;
  buttonStyle?: ButtonStyle;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef(function Button(
  props: Props,
  ref: React.ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const { children, className = "", buttonStyle = "primary", ...rest } = props;
  return (
    <StyledButton {...rest} ref={ref} className={`${className} ${buttonStyle}`}>
      {children}
    </StyledButton>
  );
});

const StyledButton = styled.button`
  --button-foreground: var(--vscode-button-foreground);
  --button-background: var(--vscode-button-background);
  --button-hoverBackground: var(--vscode-button-hoverBackground);

  border: none;
  padding: var(--input-padding-vertical) var(--input-padding-horizontal);
  text-align: center;
  outline: 1px solid transparent;
  outline-offset: 2px !important;
  color: var(--button-foreground);
  background: var(--button-background);

  [disabled] {
    pointer-events: none;
  }
  
  &:not([disabled]):hover {
    cursor: pointer;
    background: var(--button-hoverBackground);
  }
  
  &:not([disabled]):focus {
    outline-color: var(--vscode-focusBorder);
  }

  &.secondary {
    --button-foreground: var(--vscode-button-secondaryForeground);
    --button-background: var(--vscode-button-secondaryBackground);
    --button-hoverBackground: var(--vscode-button-secondaryHoverBackground);
  }
`;
