/**
 * A tiny load-once-with-retry hook for the screens' single GET. Returns the async state + a `reload`.
 * Cancels on unmount/dep-change so a slow response never sets state on a gone screen. Both screens
 * share it (a second caller exists → the abstraction is justified, anti-over-engineering rule 1).
 */
import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: unknown }
  | { readonly status: "ready"; readonly data: T };

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): {
  state: AsyncState<T>;
  reload: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // The fetcher is recreated each render; we key the effect on the caller's `deps` + reloadKey, not
  // the fetcher identity (which would re-run every render). The disable is deliberate + documented.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on caller deps + reloadKey by design
  const run = useCallback(fetcher, [...deps, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    run().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error) => {
        if (!cancelled) setState({ status: "error", error });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [run]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { state, reload };
}
