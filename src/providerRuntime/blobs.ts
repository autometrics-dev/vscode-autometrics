import { TextDecoder, TextEncoder } from "util";
import { base64ToBytes, bytesToBase64 } from "byte-base64";
import { decode } from "@msgpack/msgpack";

import type { Blob, EncodedBlob } from "./types";
import { FORM_ENCODED_MIME_TYPE } from "./constants";

/**
 * Decodes an encoded blob.
 */
export function decodeBlob(blob: EncodedBlob): Blob {
  return {
    mimeType: blob.mimeType,
    data: base64ToBytes(blob.data),
  };
}

/**
 * Encodes a blob.
 */
export function encodeBlob(blob: Blob): EncodedBlob {
  return {
    mimeType: blob.mimeType,
    data: bytesToBase64(blob.data),
  };
}

/**
 * Creates a blob from a query data string.
 */
export function fromQueryData(queryData: string): Blob {
  const commaIndex = queryData.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid query data string");
  }

  return {
    mimeType: queryData.slice(0, commaIndex),
    data: new TextEncoder().encode(queryData.slice(commaIndex + 1)),
  };
}

/**
 * Parses the content of a blob into an untyped object.
 *
 * This function supports both blobs serialized using JSON and those serialized
 * using MessagePack.
 *
 * Will throw if the MIME type does not specify a recognized serialization
 * format.
 */
export function parseBlob(blob: Blob): unknown {
  if (blob.mimeType.endsWith("+json")) {
    return JSON.parse(new TextDecoder().decode(blob.data));
  } else if (blob.mimeType.endsWith("+msgpack")) {
    return decode(blob.data);
  } else {
    throw new Error(
      `Unsupported serialization format in MIME type: ${blob.mimeType}`,
    );
  }
}

/**
 * Creates a query data string from a blob.
 */
export function toQueryData(blob: Blob): string {
  if (blob.mimeType !== FORM_ENCODED_MIME_TYPE) {
    throw new Error("Invalid MIME type for query data string");
  }

  return `${FORM_ENCODED_MIME_TYPE},${new TextDecoder().decode(blob.data)}`;
}
