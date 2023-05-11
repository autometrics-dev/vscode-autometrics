export function generateRequestRateQuery(
  functionName: string,
  moduleName?: string,
): string {
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

export function generateErrorRatioQuery(
  functionName: string,
  moduleName?: string,
): string {
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

export function generateLatencyQuery(
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
