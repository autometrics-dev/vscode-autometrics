const COUNTER_NAME = "function_calls_count";
const HISTOGRAM_BUCKET_NAME = "function_calls_duration_bucket";

const ADD_BUILD_INFO_LABELS =
  "* on (instance, job) group_left(version, commit) last_over_time(build_info[1s])";

export function getRequestRate(functionName: string) {
  return `# Rate of calls to the \`${functionName}\` function per second, averaged over 5 minute windows

${getSumQuery(COUNTER_NAME, { function: functionName })}`;
}

export function getCalledByRequestRate(functionName: string) {
  return `# Rate of calls to functions called by \`${functionName}\` per second, averaged over 5 minute windows

${getSumQuery(COUNTER_NAME, { caller: functionName })}`;
}

export function getErrorRatio(functionName: string) {
  return `# Percentage of calls to the \`${functionName}\` function that return errors, averaged over 5 minute windows

${getSumQuery(COUNTER_NAME, { function: functionName, result: "error" })} /
${getSumQuery(COUNTER_NAME, { function: functionName })}`;
}

export function getCalledByErrorRatio(functionName: string) {
  return `# Percentage of calls to functions called by \`${functionName}\` that return errors, averaged over 5 minute windows

${getSumQuery(COUNTER_NAME, { caller: functionName, result: "error" })} /
${getSumQuery(COUNTER_NAME, { caller: functionName })}`;
}

export function getLatency(functionName: string) {
  const latency = `sum by (le, function, module, commit, version) (rate(${HISTOGRAM_BUCKET_NAME}{function="${functionName}"}[5m]) ${ADD_BUILD_INFO_LABELS})`;

  return `# 95th and 99th percentile latencies for the \`${functionName}\` function

label_replace(histogram_quantile(0.99, ${latency}), "percentile_latency", "99", "", "") or
label_replace(histogram_quantile(0.95, ${latency}), "percentile_latency", "95", "", "")`;
}

export function getSumQuery(
  metricName: string,
  labels: Record<string, string> = {},
) {
  return `sum by (function, module) (rate(${metricName}{${Object.entries(labels)
    .map(([key, value]) => `${key}="${value}"`)
    .join(",")}}[5m]))`;
}
