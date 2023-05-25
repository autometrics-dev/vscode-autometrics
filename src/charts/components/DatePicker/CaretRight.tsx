import * as React from "react";
export const CaretRight = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <title>Caret right</title>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.925}
      d="m8 5 4.625 4.625L8 14.25"
    />
  </svg>
);
