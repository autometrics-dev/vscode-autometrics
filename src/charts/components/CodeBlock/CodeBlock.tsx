import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { styles } from "./prismStyles";
import styled from "styled-components";
import { Button } from "../Button";
import { Copy } from "./Copy";
import { useRef } from "react";
import { pxToEm } from "../../utils";

export function CodeBlock({ query }: { query: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <Container>
      <CodeContainer ref={ref}>
        <SyntaxHighlighter language="promql" style={styles}>
          {query}
        </SyntaxHighlighter>
      </CodeContainer>
      <StyledButton
        onClick={() => {
          navigator.clipboard.writeText(query);
          if (ref.current) {
            // ref.current.selec
            if ("selection" in document) {
              // IE
              const range = document.body.createTextRange();
              range.moveToElementText(ref.current);
              range.select();
            } else if (window.getSelection) {
              const range = document.createRange();
              range.selectNode(ref.current);
              window.getSelection().removeAllRanges();
              window.getSelection().addRange(range);
            }
          }
        }}
      >
        <Copy width="17" height="17" />
      </StyledButton>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 38px;
  background:var(--vscode-dropdown-background, --vscode-editor-background, #ffffff);
  margin: 0;
  border-radius: ${pxToEm(4)};
  border: 1px solid var(--vscode-dropdown-border, --vscode-widget-border, #ccc);
`;

const CodeContainer = styled.div`
  overflow: auto;
`;

const StyledButton = styled(Button)`
`;
