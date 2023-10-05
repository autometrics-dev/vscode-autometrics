import * as vscode from "vscode";
import {
  getStepFromTimeRange,
  roundToGrid,
  metricEntryToTimeseries,
} from "@fiberplane/prometheus-query";
import type { TimeRange, Timeseries } from "@fiberplane/prometheus-query";
import fetch from "node-fetch";

import { uniqBy } from "./utils";

export type FunctionMetric = { moduleName: string; functionName: string };

export type Prometheus = ReturnType<typeof getPrometheusClient>;

export function getPrometheusClient(prometheusUrl: string) {
  let currentUrl = prometheusUrl;

  const _onDidChangeConfig: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();

  const onDidChangConfig: vscode.Event<void> = _onDidChangeConfig.event;

  /**
   * Updates the Prometheus URL and fires the `onDidChangeConfig` event.
   */
  function setUrl(url: string) {
    if (url === currentUrl) {
      return;
    }

    currentUrl = url;
    _onDidChangeConfig.fire();
  }

  function getUrl() {
    return currentUrl;
  }

  /**
   * TODO: Implement this.
   *
   * Fetches Autometrics function names tracked in this Prometheus instance.
   */
  async function fetchFunctions(): Promise<Array<FunctionMetric>> {
    return queryAutometricsSeries({ baseUrl: getUrl() });
  }

  /**
   * Fetches the names of all metrics tracked in this Prometheus instance.
   */
  async function fetchMetricNames(): Promise<Array<string>> {
    return queryMetricNames({ baseUrl: getUrl() });
  }

  async function fetchTimeseries(
    query: string,
    timeRange: TimeRange,
  ): Promise<Array<Timeseries>> {
    return queryRange(query, timeRange, { baseUrl: getUrl() });
  }

  return {
    fetchFunctions,
    fetchMetricNames,
    fetchTimeseries,
    onDidChangConfig,
    setUrl,
    getUrl,
  };

  /**
   * Fetches the timeseries data for a given query and time range.
   *
   * NOTE - This is basically a copy of the `querySeries` function from fiberplane-prometheus-query.
   *        At first, I needed to copy it here to fix an issue with the url.
   *        But then I realized that we would need to polyfill fetch to use it,
   *        so I think we'll just keep this version here for now, and
   *        rely on the utilities to transform the request/response into the format we need.
   */
  async function queryRange(
    query: string,
    timeRange: TimeRange,
    { baseUrl }: { baseUrl: string },
  ) {
    const [stepParam, stepSeconds] = getStepFromTimeRange(timeRange);

    const params = new URLSearchParams();

    params.append("query", query);
    params.append(
      "start",
      roundToGrid(timeRange.from, stepSeconds, Math.floor),
    );
    params.append("end", roundToGrid(timeRange.to, stepSeconds, Math.ceil));
    params.append("step", stepParam);

    const url = `${baseUrl}/api/v1/query_range?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching prometheus data");
    }

    const jsonResponse = await response.json();
    if (!isObject(jsonResponse)) {
      throw new Error("Unexpected response from Prometheus");
    }

    const { data } = jsonResponse;
    if (!isObject(data)) {
      throw new Error("Invalid or missing data in Prometheus response");
    }

    const { result } = data;
    if (!Array.isArray(result)) {
      throw new Error("Invalid or missing results in Prometheus response");
    }

    return result.map(metricEntryToTimeseries);
  }
}

/**
 * Queries Prometheus for all autometrics-matching series
 */
async function queryAutometricsSeries({ baseUrl }: { baseUrl: string }) {
  // Search for all function_calls series, and only include results that have both a function and module label
  const params = new URLSearchParams();
  params.append(
    "match[]",
    '{__name__=~"function_calls(_count)?(_total)?", function!="", module!=""}',
  );

  const url = `${baseUrl}/api/v1/series?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching prometheus data");
  }

  const jsonResponse = await response.json();
  if (!isObject(jsonResponse)) {
    throw new Error("Unexpected response from Prometheus");
  }

  const { data } = jsonResponse;
  if (!Array.isArray(data)) {
    throw new Error("Invalid or missing data in Prometheus response");
  }

  return uniqBy(
    data
      .filter(
        (series) => isString(series?.function) && isString(series?.module),
      )
      .map((series) => ({
        functionName: String(series.function),
        moduleName: String(series.module),
      })),
    ({ moduleName, functionName }) => `${moduleName}::${functionName}`,
  );
}

/**
 * Queries Prometheus for all autometrics-matching series
 */
async function queryMetricNames({ baseUrl }: { baseUrl: string }) {
  const url = `${baseUrl}/api/v1/label/__name__/values`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching prometheus data");
  }

  const jsonResponse = await response.json();
  if (!isObject(jsonResponse)) {
    throw new Error("Unexpected response from Prometheus");
  }

  const { data } = jsonResponse;

  if (!Array.isArray(data) || !data.every(isString)) {
    throw new Error("Invalid or missing data in Prometheus response");
  }

  return data;
}

function isObject(
  maybeObject: unknown,
): maybeObject is Record<string, unknown> {
  return typeof maybeObject === "object" && maybeObject != null;
}

function isString(maybeString: unknown): maybeString is string {
  return typeof maybeString === "string";
}
