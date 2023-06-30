import { useRef, useState } from "react";
import { ExternalLink } from "./ExternalLink";
import { Tooltip } from "../Tooltip";

export function LinkToPrometheus(props: { href: string }) {
  const { href } = props;
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);
  console.log("hover", hover, "ref", ref.current);
  return (
    <>
      <a
        ref={ref}
        href={href}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        <ExternalLink width={16} height={16} />
      </a>
      {ref.current && hover && (
        <Tooltip anchor={ref.current} content="Open in Prometheus" />
      )}
    </>
  );
}
