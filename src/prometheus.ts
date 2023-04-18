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

export class Prometheus {
  private _onDidChangeConfig: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();

  readonly onDidChangConfig: vscode.Event<void> = this._onDidChangeConfig.event;

  /**
   * Constructor.
   *
   * Please use `loadPrometheusProvider()`, since it will handle the provider
   * instantiation for you.
   */
  constructor(private prometheusUrl: string, private provider: Exports) {}

  /**
   * Updates the Prometheus URL and fires the `onDidChangeConfig` event.
   */
  setUrl(prometheusUrl: string) {
    this.prometheusUrl = prometheusUrl;
    this._onDidChangeConfig.fire();
  }

  /**
   * Fetches Autometrics function names tracked in this Prometheus instance.
   */
  async fetchFunctionNames(): Promise<Array<string>> {
    const blob = await this._invoke(INSTANTS_QUERY_TYPE, {
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
  async fetchMetricNames(): Promise<Array<string>> {
    const queryData: AutoSuggestRequest = {
      query_type: TIMESERIES_QUERY_TYPE,
      query: "",
      field: "query",
    };

    const blob = await this._invoke(SUGGESTIONS_QUERY_TYPE, queryData);
    if (!matchesMimeTypeWithEncoding(blob.mimeType, SUGGESTIONS_MIME_TYPE)) {
      throw new Error(`Unexpected MIME type: ${blob.mimeType}`);
    }

    const suggestions = parseBlob(blob) as Array<Suggestion>;
    return suggestions
      .filter((suggestion) => suggestion.description !== "Function")
      .map((suggestion) => suggestion.text);
  }

  private _invoke(
    queryType: string,
    queryData: Record<string, string>,
  ): Promise<Blob> {
    const invoke = this.provider.invoke2;
    if (!invoke) {
      throw new Error("invoke2() not loaded");
    }

    return invoke({
      config: { url: this.prometheusUrl },
      queryData: fromQueryData(encodeQueryData(queryData)),
      queryType,
    }).then(unwrap);
  }
}

export async function loadPrometheusProvider(
  prometheusUrl: string,
): Promise<Prometheus> {
  const bundle = await fs.readFile(
    path.join(__dirname, "..", "wasm", "prometheus.wasm"),
  );
  const provider = await createRuntime(bundle, imports);
  return new Prometheus(prometheusUrl, provider);
}
