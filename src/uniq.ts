/**
 * Returns a new array with all duplicate values removed.
 */
export function uniq<T>(array: Array<T>): Array<T> {
  return [...new Set(array).values()];
}
