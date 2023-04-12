import * as vscode from "vscode";
import { MarkdownString } from "vscode";

type Options = {
  baseUrl: string;
};

function getRequestRate(functionName: string, options: Options) {
  const query = `# Rate of calls to the \`${functionName}\` function per second, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count_total{function="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getCalledByRequestRate(functionName: string, options: Options) {
  const query = `# Rate of calls to functions called by \`${functionName}\` per second, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count_total{caller="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getErrorRatio(functionName: string, options: Options) {
  const query = `# Percentage of calls to the \`${functionName}\` function that return errors, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count_total{function="${functionName}",result="error"}[5m])) /
sum by (function, module) (rate(function_calls_count_total{function="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getCalledByErrorRatio(functionName: string, options: Options) {
  const query = `# Percentage of calls to functions called by \`${functionName}\` that return errors, averaged over 5 minute windows
  
sum by (function, module) (rate(function_calls_count_total{caller="${functionName}",result="error"}[5m])) /
sum by (function, module) (rate(function_calls_count_total{caller="${functionName}"}[5m]))`;
  return buildQuery(query, options);
}

function getLatency(functionName: string, options: Options) {
  const query = `# 95th and 99th percentile latencies for the \`${functionName}\` function
  
histogram_quantile(0.99, sum by (le, function, module) (rate(function_calls_duration_bucket{function="${functionName}"}[5m]))) or
histogram_quantile(0.95, sum by (le, function, module) (rate(function_calls_duration_bucket{function="${functionName}"}[5m])))`;
  return buildQuery(query, options);
}

function buildQuery(query: string, options: { baseUrl: string }): string {
  const parameters = new URLSearchParams();
  parameters.set("g0.expr", query);
  parameters.set("g0.tab", "0");
  const url = new URL(`${options.baseUrl}/graph?${parameters.toString()}`);
  return url.toString();
}

export function getContent(name: string) {
  const config = vscode.workspace.getConfiguration("autometrics");
  const baseUrl =
    config.get<string>("prometheusUrl") || "http://localhost:9090";
  const options: Options = {
    baseUrl,
  };

  return new MarkdownString(`## Autometrics

View the live metrics for the  \`${name}\`  function:

* [Request Rate](${getRequestRate(name, options)})
* [Error Ratio](${getErrorRatio(name, options)})
* [Latency (95th and 99th percentiles)](${getLatency(name, options)})

Or, dig into the metrics of functions called by ${name}:

* [Request Rate](${getCalledByRequestRate(name, options)})
* [Error Ratio](${getCalledByErrorRatio(name, options)})`);
}
