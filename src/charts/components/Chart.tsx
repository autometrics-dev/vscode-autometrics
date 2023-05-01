import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
} from "fiberplane-charts";
import { useEffect, useMemo, useState } from "react";

import { getCurrentTimeRange } from "../utils";
import { isSameTimeRange } from "../../utils";
import type { MessageToWebview } from "../types";
import { vscode } from "../chart";

export function Chart() {
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [metric, setMetric] = useState<string | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    getCurrentTimeRange(),
  );
  const [timeseriesData, setTimeseriesData] = useState<Array<Timeseries>>([]);

  useEffect(() => {
    window.onmessage = (event: MessageEvent<MessageToWebview>) => {
      switch (event.data.type) {
        case "show_data":
          if (isSameTimeRange(event.data.timeRange, timeRange)) {
            setTimeseriesData(event.data.data);
          }
          break;

        case "show_metrics":
          const { metric, labels } = event.data;
          setMetric(metric);
          setLabels(labels);
          setTimeseriesData([]);
          requestData(metric, labels, timeRange);
          break;
      }
    };
  }, []);

  function onChangeTimeRange(timeRange: TimeRange) {
    setTimeRange(timeRange);

    if (metric) {
      requestData(metric, labels, timeRange);
    }
  }

  return (
    <div>
      <h1>{metric}</h1>
      <p>{JSON.stringify(labels)}</p>
      <MetricsChart
        graphType={graphType}
        stackingType={stackingType}
        timeRange={timeRange}
        timeseriesData={timeseriesData}
        onChangeGraphType={setGraphType}
        onChangeStackingType={setStackingType}
        onChangeTimeRange={onChangeTimeRange}
      />
    </div>
  );
}

function requestData(
  metric: string,
  labels: Record<string, string>,
  timeRange: TimeRange,
) {
  vscode.postMessage({
    type: "request_data",
    query: `${metric}{${Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(",")}}`,
    timeRange,
  });
}
