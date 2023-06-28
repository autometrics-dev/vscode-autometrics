import { TooltipAnchor } from "fiberplane-charts";
import {
  useFloating,
  offset as offsetMiddleware,
  autoPlacement,
  Alignment,
  Placement,
} from "@floating-ui/react";
import styled from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import { pxToEm } from "../../utils";
import { useMemo } from "react";

function adjustPlacementForAlignment(
  placement: "top" | "bottom",
  alignment?: Alignment,
) {
  if (!alignment) {
    return placement;
  }
  return `${placement}-${alignment}` as Placement;
}

type HidePosition = {
  x?: number;
  y?: number;
};

const ANIMATION_DISTANCE = 10;

function getHiddenPosition(placement: Placement): HidePosition {
  switch (placement) {
    case "top":
      return { y: ANIMATION_DISTANCE };
    case "right":
    case "right-start":
      return { x: -ANIMATION_DISTANCE };
    case "left":
      return { x: ANIMATION_DISTANCE };
    default:
      return { y: -ANIMATION_DISTANCE };
  }
}

export function Tooltip(props: {
  anchor: TooltipAnchor | Element;
  children: React.ReactNode;
  placement?: "top" | "bottom";
  offset?: number;
  className?: string;
  alignment?: Alignment;
}) {
  const { anchor, children, offset = 0, className, alignment } = props;
  const placement = adjustPlacementForAlignment(
    props.placement ?? "top",
    alignment,
  );
  const middleware = useMemo(() => {
    const options = {
      crossAxis: true,
      padding: 20,
      alignment,
      allowedPlacements: [
        adjustPlacementForAlignment("top", alignment),
        adjustPlacementForAlignment("bottom", alignment),
      ] as Placement[],
    };

    const placement = autoPlacement(options);

    return offset ? [offsetMiddleware(offset), placement] : [placement];
  }, [offset, alignment]);
  const {
    refs,
    floatingStyles,
    placement: currentPlacement,
  } = useFloating({
    elements: {
      reference: anchor,
    },
    placement,
    middleware,
  });

  const shouldReduceMotion = useReducedMotion();

  // console.log('currentPlacement', currentPlacement);
  return (
    <Container ref={refs.setFloating} style={floatingStyles}>
      <Content
        className={className}
        transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: "easeOut" }}
        variants={{
          show: {
            opacity: 1,
            x: 0,
            y: 0,
          },
          hide: {
            opacity: 0,
            ...getHiddenPosition(placement),
          },
        }}
        initial="hide"
        animate="show"
        exit="hide"
      >
        {" "}
        {children}
      </Content>
    </Container>
  );
}

const Container = styled.div`
z-index: 1;
`;

const Content = styled(motion.div)`
  text-align: left;
  color: var(--vscode-editorHoverWidget-foreground);
  background: var(--vscode-editorHoverWidget-background);
  border: 1px solid var(--vscode-editorHoverWidget-border);
  font-size: ${pxToEm(10)};
`;
