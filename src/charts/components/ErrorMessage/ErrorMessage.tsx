import styled from "styled-components";
import { ErrorIcon } from "./ErrorIcon";
import { pxToEm } from "../../utils";

export function ErrorMessage(props: { children: React.ReactNode }) {
  return (
    <Content>
      <StyledErrorIcon />
      <ErrorMessageText>{props.children}</ErrorMessageText>
    </Content>
  );
}

const Content = styled.div`
  display: flex;
  align-items: center;
  color: var(--vscode-errorForeground, inherit);
  gap: ${pxToEm(8)};
  margin: ${pxToEm(8)} 0 0;
`;

const StyledErrorIcon = styled(ErrorIcon)`
  flex: 0 0 ${pxToEm(23)};
`;

const ErrorMessageText = styled.div`
  overflow-wrap: anywhere;
`;
