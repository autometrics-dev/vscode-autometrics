import * as fs from "fs/promises";
import * as path from "path";

import { createRuntime, Exports } from "./providerRuntime";
import { imports } from "./providerRuntime/imports";

/**
 * A request for a provider to provide auto-suggestions.
 */
export type AutoSuggestRequest = {
  /**
   * The value of the field being typed by the user, up to the focus offset.
   */
  query: string;

  /**
   * The query type of the provider we're requesting suggestions for.
   */
  query_type: string;

  /**
   * The field in the query form we're requesting suggestions for.
   */
  field: string;

  /**
   * Some other fields of the cell data.
   * The choice of which other fields are sent in the request is
   * left to the caller.
   * The encoding of the other fields is left to the implementation
   * in Studio, and follows the format of
   * cells [Query Data](crate::ProviderCell::query_data).
   */
  other_field_data?: string;
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

export type Prometheus = Exports;

/**
 * A suggestion for a provider's auto-suggest functionality.
 */
export type Suggestion = {
  /**
   * The offset to start applying the suggestion,
   *
   * All text should be replaced from that offset up to the end of the
   * query in AutoSuggestRequest.
   *
   * When missing, append the suggestion to the cursor
   */
  from?: number;
  text: string;
  description?: string;
};

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

export async function loadPrometheusProvider(): Promise<Prometheus> {
  const bundle = await fs.readFile(
    path.join(__dirname, "..", "wasm", "prometheus.wasm"),
  );
  return createRuntime(bundle, imports);
}
