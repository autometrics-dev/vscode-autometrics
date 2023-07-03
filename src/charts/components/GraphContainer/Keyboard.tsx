import * as React from "react";

export const Keyboard = React.forwardRef(
  (
    props: React.SVGAttributes<HTMLOrSVGElement>,
    ref: React.ForwardedRef<SVGSVGElement>,
  ) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={17}
      fill="none"
      viewBox="0 0 28 17"
      ref={ref}
      {...props}
    >
      <title>Keyboard</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M.7.676h26.6c.38 0 .7.325.7.712v14.223c0 .387-.32.712-.7.712H.7c-.38 0-.7-.325-.7-.712V1.388C0 1.001.32.676.7.676ZM8.715 7.44h2.102v2.12H8.714V7.44Zm4.113 0h2.102v2.12h-2.102V7.44Zm-6.17 3.9h14.427v2.136H6.657V11.34Zm10.283-3.9h2.087v2.12H16.94V7.44Zm6.155 3.9h2.102v2.136h-2.102V11.34Zm0-7.816h2.102V5.66h-2.102V3.524Zm-4.098 0h2.087V5.66h-2.087V3.524Zm-4.113 0h2.102V5.66h-2.102V3.524Zm-4.114 0h2.103V5.66H10.77V3.524Zm-4.113 0H8.76V5.66H6.657V3.524ZM2.544 11.34h2.102v2.136H2.544V11.34Zm0-3.9H6.75v2.12H2.544V7.44Zm0-3.916h2.102V5.66H2.544V3.524ZM21.038 7.44h4.159v2.12h-4.159V7.44Z"
        clipRule="evenodd"
      />
    </svg>
  ),
);
