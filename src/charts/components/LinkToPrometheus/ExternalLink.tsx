import * as React from "react";
import { SVGProps } from "react";

export const ExternalLink = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    viewBox="0 0 26 26"
    {...props}
  >
    <path
      fill="currentColor"
      d="m9.66 14.934 1.398 1.4L21 6v6h2V3.016h-8V5h4.5l-9.84 9.934Z"
    />
    <path fill="currentColor" d="M22.977 15H21v6H5V5l6-.01V3H3v20h19.977v-8Z" />
  </svg>
);
