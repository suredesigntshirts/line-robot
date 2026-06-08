/**
 * The whole app is two screens behind a History-API router (no `#` fragments — LIFF forbids them).
 * `liff.init()` has already resolved by the time this mounts (awaited in `main.tsx`), so it is safe
 * here to read + mutate the URL.
 */
import { useEffect, useState } from "preact/hooks";
import { normalizePath, parseRoute, resolveInitialPath } from "./lib/deeplink.js";
import { DetailScreen } from "./screens/Detail.js";
import { ListScreen } from "./screens/List.js";

export function App() {
  // Snapshot the initial route once. Deep links (…/p/{id}) may arrive via the `liff.state` query
  // param rather than the real pathname, so resolve both.
  const [path, setPath] = useState<string>(() =>
    resolveInitialPath(window.location.pathname, window.location.search),
  );

  useEffect(() => {
    // Align the address bar with the resolved route (so back/forward + reload are consistent) and
    // subscribe to browser navigation. Mount-only.
    if (normalizePath(window.location.pathname) !== path) {
      window.history.replaceState(null, "", path);
    }
    const onPop = (): void => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [path]);

  const navigate = (to: string): void => {
    window.history.pushState(null, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  const route = parseRoute(path);
  return route.name === "detail" ? (
    <DetailScreen id={route.id} navigate={navigate} />
  ) : (
    <ListScreen navigate={navigate} />
  );
}
