import { TimeRange } from "fiberplane-charts";
import { FunctionChart } from "./FunctionChart";
import { TimeRangeProps } from "../types";

type Props = TimeRangeProps & {
  functionName: string;
  moduleName?: string;
};

export function FunctionCharts(props: Props) {
  const { functionName, moduleName, timeRange, setTimeRange } = props;

  const requestRateQuery = generateRequestRateQuery(functionName, moduleName);
  const errorRatioQuery = generateErrorRatioQuery(functionName, moduleName);
  const latencyQuery = generateLatencyQuery(functionName, moduleName);
  console.log("query", errorRatioQuery);

  return (
    <div>
      <h1>{functionName}</h1>
      <FunctionChart
        title="Request Rate"
        query={requestRateQuery}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        key="request_rate"
      />
      <FunctionChart
        title="Error Ratio"
        query={errorRatioQuery}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        key="error_ratio"
      />
      <FunctionChart
        title="Latency"
        query={latencyQuery}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        key="latency_query"
      />
    </div>
  );
}

/**
 * Request Rate
Error Ratio
Latency (95th and 99th percentiles)
Or, dig into the metrics of functions called by authorization_get:

Request Rate
Error Ratio
 */

// type QueryType =
//   | "request_rate"
//   | "error_ratio"
//   | "latency";
// | "called_by_request_rate"
// | "called_by_error_ratio"

// function getQuery();

// const BUILD_INFO_LABELS = "group_left(version, commit) (last_over_time(build_info[1s]) or on (instance, job) up))"
function generateRequestRateQuery(
  functionName: string,
  moduleName?: string,
): string {
  console.log("moduleName", moduleName);
  // return `sum by (function, module, version, commit) (
  // rate(
  //   {
  //     __name__=~"function_calls_count(?:_total)?",
  //     function=~"${functionName}"
  //   }[1m]
  // )
  // * on(instance, job) group_left(version, commit) (last_over_time(build_info[1s]) or on (instance, job) up)) > 0`;
  // return `sum by (function, module, version, commit) (  rate(    {      __name__=~"function_calls_count(?:_total)?",      function=~"${functionName}"    }[5m]  )  * on(instance, job) group_left(version, commit) (last_over_time(build_info[1s]) or on (instance, job) up)) > 0`;
  // return `sum by (function, module) (rate(function_calls_count{function="${functionName}"}[5m]))`;
  // authorization_list_by_resource
  return `sum by (function, module, version, commit) (
  rate(
    { 
      __name__=~"function_calls_count(?:_total)?",
      function=~"${functionName}",
      module=~"${moduleName || ".*"}"
    }[5m] 
  ) 
  * on(instance, job) group_left(version, commit) (
    last_over_time(
      build_info[1s]
    ) or on (instance, job) up
  )
) > 0`;
}

function generateErrorRatioQuery(
  functionName: string,
  moduleName?: string,
): string {
  //   let request_rate = request_rate_query(counter_name, label_key, label_value);
  //   format!("(sum by (function, module, commit, version) (rate({counter_name}{{{label_key}=\"{label_value}\",result=\"error\"}}[5m]) {ADD_BUILD_INFO_LABELS}))
  // /
  // ({request_rate})",)
  return `(  
  sum by(function, module, version, commit) (
    rate(      
      {        
        __name__=~"function_calls_count(?:_total)?",        
        result="error",         
        function=~"${functionName}",      
        module=~"${moduleName || ".*"}"
      }[5m]    
    )    
    * on(instance, job) group_left(version, commit) (
      last_over_time(
        build_info[1s]
      ) or on (instance, job) up
    )  
  ) > 0
) / (  
  sum by(function, module, version, commit) (    
    rate(      
      {        
        __name__=~"function_calls_count(?:_total)?",        
        function=~"${functionName}",
        module=~"${moduleName || ".*"}"
      }[5m]    
    )    
    * on(instance, job) group_left(version, commit) (
      last_over_time(
        build_info[1s]
      ) or on (instance, job) up
    )  
  ) > 0
)`;
}

function generateLatencyQuery(
  functionName: string,
  moduleName?: string,
): string {
  return `label_replace(
  histogram_quantile(
    0.99, 
    sum by (le, function, module, commit, version) (
      rate(
        function_calls_duration_bucket{
          function=~"${functionName}",
          module=~"${moduleName || ".*"}"
        }[5m]
      )
      # Attach the "version" and "commit" labels from the "build_info" metric 
      * on (instance, job) group_left(version, commit) (
        last_over_time(build_info[1s])
      )
    )
  ),
  # Add the label {percentile_latency="99"} to the time series
  "percentile_latency", 
  "99", 
  "", 
  ""
) or label_replace(
  histogram_quantile(
    0.95, 
    sum by (le, function, module, commit, version) (
      rate(
        function_calls_duration_bucket{
          function=~"${functionName}",
          module=~"${moduleName || ".*"}"
        }[5m]
      )
      # Attach the "version" and "commit" labels from the "build_info" metric 
      * on (instance, job) group_left(version, commit) (
        last_over_time(build_info[1s])
      )
    )
  ),
  # Add the label {percentile_latency="95"} to the time series
  "percentile_latency", 
  "95", 
  "", 
  ""
)`;
}

// fn latency_query(bucket_name: &str, label_key: &str, label_value: &str) -> String {
//   let latency = format!(
//       "sum by (le, function, module, commit, version) (rate({bucket_name}{{{label_key}=\"{label_value}\"}}[5m]) {ADD_BUILD_INFO_LABELS})"
//   );
//   format!(
//       "histogram_quantile(0.99, {latency}) or
// histogram_quantile(0.95, {latency})"
//   )
// }
