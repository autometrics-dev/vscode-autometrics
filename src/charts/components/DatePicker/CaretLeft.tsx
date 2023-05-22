import * as React from "react";
const SvgComponent = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <title>Caret left</title>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.925}
      d="M12.625 14.25 8 9.625 12.625 5"
    />
  </svg>
);

export default SvgComponent;
