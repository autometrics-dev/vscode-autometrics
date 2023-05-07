import { TimeRange } from "fiberplane-charts";
import { useState } from "react";

import { PanelOptions } from "../../chartPanel";
import { getCurrentTimeRange } from "../utils";
import type { MessageToWebview } from "../types";
import { vscode } from "../chart";
import { useHandler } from "../hooks/useHandler";
import { SingleChart } from "./SingleChart";
import { useMessage } from "../hooks";

export function PanelContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    getCurrentTimeRange(),
  );
  const [panelOptions, setPanelOptions] = useState<PanelOptions | null>(null);

  // useMessagageListener(type: MessageToWebview["type"], handler: (event: MessageToWebview & {type: Type]) => void

  // const onMessage = useHandler((event: MessageEvent<MessageToWebview>) => {
  //   switch (event.data.type) {
  //     case "show_panel": {
  //       const { options } = event.data;
  //       setPanelOptions(options);
  //       break;
  //     }

  //     // case "show_data":
  //     //   if (isSameTimeRange(event.data.timeRange, timeRange)) {
  //     //     setTimeseriesData(event.data.data);
  //     //   }
  //     //   break;
  //   }
  // });
  // useEffect(() => {
  //   window.onmessage = onMessage;
  // }, [onMessage]);

  useMessage<MessageToWebview>((event) => {
    if (event.data.type === "show_panel") {
      const { options } = event.data;
      setPanelOptions(options);
    }
  });

  // const onChangeTimeRange = useHandler((query: string) => {
  //   setTimeRange(timeRange);

  //   //   if (query) {
  //   //     requestData(query, timeRange);
  //   //   }
  // });

  console.log("panelOptions", panelOptions);
  if (panelOptions === null || panelOptions.type === "function_graphs") {
    return <div>Nothing to show</div>;
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
