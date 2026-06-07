/**
 * Map over items with a bounded number of in-flight promises, preserving input order in the result
 * (workers pull from a shared cursor). Lets us fan out independent I/O — e.g. per-image vision calls
 * — without spawning all N at once or serialising them one at a time. Pure utility: no domain or
 * infrastructure knowledge.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) {
        return;
      }
      results[i] = await fn(items[i] as T, i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
