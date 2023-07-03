import { TooltipAnchor } from "fiberplane-charts";
import { useFloating } from "@floating-ui/react";
import styled from "styled-components";
import { pxToEm } from "../../utils";

export function Tooltip(props: {
  anchor: TooltipAnchor;
  content: React.ReactNode;
}) {
  const { anchor, content } = props;
  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: anchor,
    },
  });

  return (
    <Container ref={refs.setFloating} style={floatingStyles}>
      <Content>{content}</Content>
    </Container>
  );
}

const Container = styled.div`
z-index: 1;
`;

const Content = styled.div`
  text-align: left;
  color: var(--vscode-editorHoverWidget-foreground);
  background: var(--vscode-editorHoverWidget-background);
  border: 1px solid var(--vscode-editorHoverWidget-border);
  font-size: 0.625rem;
`;
