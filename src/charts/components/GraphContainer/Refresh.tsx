import * as React from "react";

export const Refresh = (props: React.SVGAttributes<HTMLOrSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={20}
    fill="none"
    viewBox="0 0 32 20"
    {...props}
  >
    <title>Refresh</title>
    <path
      fill="currentColor"
      fillOpacity={0.4}
      d="M19.972 19.65H9.342a5.014 5.014 0 0 1-5.035-5.034V3.426L1.72 6.014.46 4.755 5.217 0l4.685 4.755-1.258 1.259-2.588-2.588v11.19a3.283 3.283 0 0 0 3.287 3.286h10.63v1.748ZM12.49.35h10.629c2.727 0 5.035 2.307 5.035 5.035v11.258l2.587-2.587L32 15.315 27.245 20l-4.755-4.685 1.259-1.26 2.587 2.588V5.384c0-1.818-1.399-3.216-3.217-3.216H12.49V.349Z"
    />
  </svg>
);
