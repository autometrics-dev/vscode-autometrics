import * as React from "react";
export const Copy = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    viewBox="0 0 26 26"
    {...props}
  >
    <title>Copy</title>
    <path
      fill="currentColor"
      fillOpacity={0.4}
      fillRule="evenodd"
      d="M21 5H8.714v12.286H21V5ZM8.714 3h-2v16.286H23V3H8.714Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillOpacity={0.4}
      fillRule="evenodd"
      d="M5 7v14h14v2H3V7h2Z"
      clipRule="evenodd"
    />
  </svg>
);
