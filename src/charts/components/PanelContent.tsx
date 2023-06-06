import { useState } from "react";

import { PanelOptions, TimeRangeOptions } from "../../chartPanel";
import type { MessageToWebview } from "../types";
import { SingleChart } from "./SingleChart/SingleChart";
import { useMessage } from "../hooks";
import { FunctionCharts } from "./FunctionCharts";
import { GraphContextProvider } from "../state";

export function PanelContent() {
  const [panelOptions, setPanelOptions] = useState<
    (PanelOptions & TimeRangeOptions) | null
  >(null);

  useMessage<MessageToWebview>((event) => {
    if (event.data.type === "show_panel") {
      const { options } = event.data;
      setPanelOptions(options);
    }
  });

  if (panelOptions === null) {
    return <div>Nothing to show</div>;
  }

  const { timeRange } = panelOptions;
  return (
    <GraphContextProvider initialTimeRange={timeRange}>
      {panelOptions.type === "function_graphs" ? (
        <FunctionCharts
          functionName={panelOptions.functionName}
          moduleName={panelOptions.moduleName}
        />
      ) : (
        <div>
          <SingleChart options={panelOptions} />
        </div>
      )}
    </GraphContextProvider>
  );
}
