import {
  GraphType,
  MetricsChart,
  StackingType,
  TimeRange,
  Timeseries,
} from "fiberplane-charts";
import { useEffect, useState } from "react";

import { ChartOptions, getTitle } from "../../chartPanel";
import {
  getCalledByRequestRate,
  getRequestRate,
  getSumQuery,
} from "../../queries";
import { getCurrentTimeRange } from "../utils";
import { isSameTimeRange } from "../../utils";
import type { MessageToWebview } from "../types";
import { vscode } from "../chart";

export function Chart() {
  const [graphType, setGraphType] = useState<GraphType>("line");
  const [query, setQuery] = useState<string | null>(null);
  const [stackingType, setStackingType] = useState<StackingType>("none");
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    getCurrentTimeRange(),
  );
  const [timeseriesData, setTimeseriesData] = useState<Array<Timeseries>>([]);

  useEffect(() => {
    window.onmessage = (event: MessageEvent<MessageToWebview>) => {
      switch (event.data.type) {
        case "show_chart": {
          const { options } = event.data;
          const query = getQuery(options);

          setQuery(query);
          setTimeseriesData([]);
          requestData(query, timeRange);
          break;
        }

        case "show_data":
          if (isSameTimeRange(event.data.timeRange, timeRange)) {
            setTimeseriesData(event.data.data);
          }
          break;
      }
    };
  }, []);

  function onChangeTimeRange(timeRange: TimeRange) {
    setTimeRange(timeRange);

    if (query) {
      requestData(query, timeRange);
    }
  }

  return (
    <div>
      <h1>{query}</h1>
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

/**
 * TODO: For the new design, we should show multiple queries for a given chart
 *       options.
 */
function getQuery(options: ChartOptions) {
  switch (options.type) {
    case "called_by":
      return getCalledByRequestRate(options.functionName);
    case "function":
      return getRequestRate(options.functionName);
    case "metric":
      return getSumQuery(options.metricName);
  }
}

function requestData(query: string, timeRange: TimeRange) {
  vscode.postMessage({ type: "request_data", query, timeRange });
}
