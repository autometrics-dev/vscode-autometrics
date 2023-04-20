import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";

import { createRuntime, Exports } from "./providerRuntime";
import { imports } from "./providerRuntime/imports";
import {
  INSTANTS_MIME_TYPE,
  INSTANTS_QUERY_TYPE,
  SUGGESTIONS_MIME_TYPE,
  SUGGESTIONS_QUERY_TYPE,
  TIMESERIES_QUERY_TYPE,
} from "./providerRuntime/constants";
import { fromQueryData, parseBlob } from "./providerRuntime/blobs";
import { encodeQueryData } from "./providerRuntime/queryData";
import { unwrap } from "./providerRuntime/unwrap";
import { matchesMimeTypeWithEncoding } from "./providerRuntime/matchesMimeTypes";
import { Blob } from "./providerRuntime/types";
import { AutoSuggestRequest, Suggestion } from "./providerRuntime/suggestions";
import { uniq } from "./uniq";

/**
 * A single data-point in time, with meta-data about the metric it was taken
 * from.
 */
export type Instant = {
  name: string;
  labels: Record<string, string>;
  metric: Metric;
};

/**
 * A single metric value.
 *
 * Metric values are taken at a specific timestamp and contain a floating-point
 * value as well as OpenTelemetry metadata.
 */
export type Metric = {
  time: Timestamp;
  value: number;
} & OtelMetadata;

/**
 * Metadata following the OpenTelemetry metadata spec.
 */
export type OtelMetadata = {
  // rome-ignore lint/suspicious/noExplicitAny: generated type
  attributes: Record<string, any>;
  // rome-ignore lint/suspicious/noExplicitAny: generated type
  resource: Record<string, any>;
  traceId?: OtelTraceId;
  spanId?: OtelSpanId;
};

/**
 * SeverityNumber, as specified by OpenTelemetry:
 *  https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#field-severitynumber
 */
export type OtelSeverityNumber = number;

/**
 * Span ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
export type OtelSpanId = Uint8Array;

/**
 * Trace ID, as specified by OpenTelemetry:
 *  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
 */
export type OtelTraceId = Uint8Array;

/**
 * A series of metrics over time, with metadata.
 */
export type Timeseries = {
  name: string;
  labels: Record<string, string>;
  metrics: Array<Metric>;

  /**
   * Whether the series should be rendered. Can be toggled by the user.
   */
  visible: boolean;
} & OtelMetadata;

export type Timestamp = string;

export type Prometheus = Awaited<ReturnType<typeof loadPrometheusProvider>>;

export async function loadPrometheusProvider(prometheusUrl: string) {
  const bundle = await fs.readFile(
    path.join(__dirname, "..", "wasm", "prometheus.wasm"),
  );
  const provider = await createRuntime(bundle, imports);

  const _onDidChangeConfig: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();

  const onDidChangConfig: vscode.Event<void> = _onDidChangeConfig.event;

  /**
   * Updates the Prometheus URL and fires the `onDidChangeConfig` event.
   */
  function setUrl(url: string) {
    prometheusUrl = url;
    _onDidChangeConfig.fire();
  }

  /**
   * Fetches Autometrics function names tracked in this Prometheus instance.
   */
  async function fetchFunctionNames(): Promise<Array<string>> {
    const blob = await _invoke(INSTANTS_QUERY_TYPE, {
      query: "function_calls_count",
    });
    if (!matchesMimeTypeWithEncoding(blob.mimeType, INSTANTS_MIME_TYPE)) {
      throw new Error(`Unexpected MIME type: ${blob.mimeType}`);
    }

    const instants = parseBlob(blob) as Array<Instant>;
    return uniq(
      instants.map(
        (instant) => `${instant.labels.module}::${instant.labels.function}`,
      ),
    );
  }

  /**
   * Fetches the names of all metrics tracked in this Prometheus instance.
   */
  async function fetchMetricNames(): Promise<Array<string>> {
    const queryData: AutoSuggestRequest = {
      query_type: TIMESERIES_QUERY_TYPE,
      query: "",
      field: "query",
    };

    const blob = await _invoke(SUGGESTIONS_QUERY_TYPE, queryData);
    if (!matchesMimeTypeWithEncoding(blob.mimeType, SUGGESTIONS_MIME_TYPE)) {
      throw new Error(`Unexpected MIME type: ${blob.mimeType}`);
    }

    const suggestions = parseBlob(blob) as Array<Suggestion>;
    return suggestions
      .filter((suggestion) => suggestion.description !== "Function")
      .map((suggestion) => suggestion.text);
  }

  function _invoke(
    queryType: string,
    queryData: Record<string, string>,
  ): Promise<Blob> {
    const invoke = provider.invoke2;
    if (!invoke) {
      throw new Error("invoke2() not loaded");
    }

    return invoke({
      config: { url: prometheusUrl },
      queryData: fromQueryData(encodeQueryData(queryData)),
      queryType,
    }).then(unwrap);
  }

  return {
    fetchFunctionNames,
    fetchMetricNames,
    onDidChangConfig,
    setUrl,
  };
}
