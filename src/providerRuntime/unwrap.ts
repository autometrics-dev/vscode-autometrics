import type { Result } from "./types";

/**
 * Returns whether a `Result<T, E>` contains an `Ok` result.
 */
export function isOk<T, E>(result: Result<T, E>): result is { Ok: T } {
  return "Ok" in result;
}

/**
 * Unwraps a `Result<T, E>` and returns the value of type `T`.
 *
 * Throws an exception of type `E` if the result contained an error.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!isOk(result)) {
    throw result.Err;
  }

  return result.Ok;
}
