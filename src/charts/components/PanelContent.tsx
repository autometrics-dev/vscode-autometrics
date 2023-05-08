import { TimeRange } from "fiberplane-charts";
import { useState } from "react";

import { PanelOptions, SingleChartOptions } from "../../chartPanel";
import { getCurrentTimeRange } from "../utils";
import type { MessageToWebview } from "../types";
import { SingleChart } from "./SingleChart/SingleChart";
import { useMessage } from "../hooks";

export function PanelContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    getCurrentTimeRange(),
  );
  const [panelOptions, setPanelOptions] = useState<PanelOptions | null>(null);

  useMessage<MessageToWebview>((event) => {
    if (event.data.type === "show_panel") {
      const { options } = event.data;
      setPanelOptions(options);
    }
  });

  if (panelOptions === null) {
    return <div>Nothing to show</div>;
  }

  if (panelOptions.type === "function_graphs") {
    const functionChartOptions: SingleChartOptions = {
      ...panelOptions,
      type: "function",
    };
    const calledByOptions: SingleChartOptions = {
      ...panelOptions,
      type: "called_by",
    };

    return (
      <div>
        <h1>{panelOptions.functionName}</h1>
        <SingleChart
          key="function"
          options={functionChartOptions}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        <SingleChart
          key="called_by"
          options={calledByOptions}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      </div>
    );
  }

  return (
    <div>
      <SingleChart
        options={panelOptions}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />
    </div>
  );
}
