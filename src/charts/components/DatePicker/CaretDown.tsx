import * as React from "react";
export const CaretDown = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    viewBox="0 0 21 20"
    {...props}
  >
    <title>Caret down</title>
    <path
      stroke="currentColor"
      strokeLinecap="square"
      strokeWidth={2}
      d="m5.461 8.23 5.23 5.231 5.231-5.23"
    />
  </svg>
);
