import { SUPPORTED_ENCODINGS } from "./constants";

/**
 * Returns `true` if the actual MIME type matches the expected MIME type with
 * any of the supported serialization formats.
 *
 * Returns `false` otherwise.
 */
export function matchesMimeTypeWithEncoding(
  actualMimeType: string,
  expectedMimeType: string,
): boolean {
  return SUPPORTED_ENCODINGS.some(
    (encoding) => actualMimeType === `${expectedMimeType}+${encoding}`,
  );
}
