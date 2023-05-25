import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

type ButtonStyle = "primary" | "secondary";
type Props = {
  children: React.ReactNode;
  buttonStyle?: ButtonStyle;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: Props): JSX.Element {
  const { children, className = "", buttonStyle = "primary", ...rest } = props;
  return (
    <StyledButton {...rest} className={`${className} ${buttonStyle}`}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  --button-foreground: var(--vscode-button-foreground);
  --button-background: var(--vscode-button-background);
  --button-hoverBackground: var(--vscode-button-hoverBackground);

  border: none;
  padding: var(--input-padding-vertical) var(--input-padding-horizontal);
  /* width: 100%; */
  text-align: center;
  outline: 1px solid transparent;
  outline-offset: 2px !important;
  color: var(--button-foreground);
  background: var(--button-background);

  &:hover {
    cursor: pointer;
    background: var(--button-hoverBackground);
  }
  
  &:focus {
    outline-color: var(--vscode-focusBorder);
  }

  &.secondary {
    --button-foreground: var(--vscode-button-secondaryForeground);
    --button-background: var(--vscode-button-secondaryBackground);
    --button-hoverBackground: var(--vscode-button-secondaryHoverBackground);
  }
`;
