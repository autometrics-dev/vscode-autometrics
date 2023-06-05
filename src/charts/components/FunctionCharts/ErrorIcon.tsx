import * as React from "react";
export const ErrorIcon = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={20}
    fill="none"
    viewBox="0 0 23 20"
    {...props}
  >
    <title>Error icon</title>
    <path
      fill="currentColor"
      d="M22.906 19.464 11.921.178a.35.35 0 0 0-.608 0L5.816 9.821.323 19.464a.362.362 0 0 0 0 .356.35.35 0 0 0 .303.18h21.978a.35.35 0 0 0 .303-.18.363.363 0 0 0 0-.356ZM12.67 17.143H10.56V15h2.11v2.143Zm0-3.572H10.56V8.096h2.11v5.475Z"
    />
  </svg>
);
