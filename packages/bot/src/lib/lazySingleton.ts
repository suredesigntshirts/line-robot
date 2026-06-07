/**
 * Cold-start memoisation for a Lambda's composition root. Returns a getter that runs `factory`
 * at most once per warm container and hands back the same Promise on every subsequent call —
 * the standard `let p; p ??= factory(); return p` pattern, factored out so all five Lambda entry
 * points share one implementation.
 *
 * NOTE — rejection is memoised. If `factory()` rejects (e.g. SSM unavailable at cold start), the
 * rejected Promise is cached and every later call rejects with the same error until the container
 * is recycled. This matches the existing per-Lambda behaviour and is INTENTIONALLY preserved (see
 * plans/cleanup/00-master-plan.md line 133: "the underlying `??=` logic is correct and should not
 * be altered"). Do NOT add retry-on-rejection here without a dedicated change-unit — it would
 * alter the processor's observable cold-start failure mode.
 */
export function lazySingleton<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => {
    promise ??= factory();
    return promise;
  };
}
