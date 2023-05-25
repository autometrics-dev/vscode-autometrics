import * as React from "react";

export const Clock = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    viewBox="0 0 21 20"
    {...props}
  >
    <title>Clock</title>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.461 20c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10Zm.381-16.923h-.762a.39.39 0 0 0-.388.392v6.908c0 .217.177.392.385.392h5.384a.38.38 0 0 0 .385-.388v-.762a.387.387 0 0 0-.378-.388h-4.237V3.462a.38.38 0 0 0-.389-.385Z"
      clipRule="evenodd"
    />
  </svg>
);
