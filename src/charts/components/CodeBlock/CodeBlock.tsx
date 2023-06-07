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
            if (window.getSelection) {
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(ref.current);
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
              return;
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
  margin-top: ${pxToEm(13)};
  border-radius: ${pxToEm(4)};
  border: 1px solid var(--vscode-dropdown-border, --vscode-widget-border, #ccc);
`;

const CodeContainer = styled.div`
  overflow: auto;
`;

const StyledButton = styled(Button)`
  border-radius: var(--vscode-corner-size, ${pxToEm(4)});
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;
