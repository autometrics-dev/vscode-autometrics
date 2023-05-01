/**
 * Key used for determining uniqueness.
 */
type Key = number | string;

/**
 * Returns an array with all duplicate values removed.
 *
 * Uniqueness is determined by the given key function. If multiple items appear
 * with the same key, only the first is returned.
 */
export function uniqBy<T, K extends Key>(
  array: Array<T>,
  getKeyFn: (item: T) => K,
): Array<T> {
  const result = [];
  const keys = new Set<K>();
  for (const item of array) {
    const key = getKeyFn(item);
    if (!keys.has(key)) {
      result.push(item);
      keys.add(key);
    }
  }

  return result;
}
