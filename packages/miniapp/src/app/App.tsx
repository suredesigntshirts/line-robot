/**
 * The app shell + History-API router. `liff.init()` has already resolved by the time this mounts
 * (awaited in main.tsx), so it is safe here to read/mutate the URL. No router library — the two
 * frozen route shapes (`/` list, `/p/{id}` detail) are a tiny `parseRoute` switch; pulling in a
 * framework would violate the anti-over-engineering rules.
 *
 * ROUTE-SHAPE FREEZE: `/` = my-listings, `/p/{id}` = detail (plan-17 Flex deep links + rich-menu tabs
 * resolve here). New screens (claim/saved/viewings) are ADDITIVE — Build C/D extends `parseRoute`'s
 * union + adds a branch to the switch below WITHOUT changing the two frozen shapes. Until then the
 * my-listings header's saved/viewings tabs render an in-screen "coming soon" panel (no premature
 * route).
 */

import { createTranslator, type UiLocale } from "@line-robot/ui";
import { useEffect, useState } from "react";
import type { ApiClient } from "../lib/api.ts";
import { normalizePath, parseRoute, resolveInitialPath } from "../lib/deeplink.ts";
import { DetailScreen } from "../screens/DetailScreen.tsx";
import { MyListingsScreen } from "../screens/MyListingsScreen.tsx";
import { AppContextProvider } from "./context.ts";

export interface AppProps {
  readonly api: ApiClient;
  readonly locale: UiLocale;
}

export function App({ api, locale }: AppProps) {
  // Snapshot the initial route once. Deep links (…/p/{id}) may arrive via the `liff.state` query
  // param rather than the real pathname, so resolve both.
  const [path, setPath] = useState<string>(() =>
    resolveInitialPath(window.location.pathname, window.location.search),
  );

  useEffect(() => {
    // Align the address bar with the resolved route (so back/forward + reload are consistent) and
    // subscribe to browser navigation. Mount-only.
    setPath((current) => {
      if (normalizePath(window.location.pathname) !== current) {
        window.history.replaceState(null, "", current);
      }
      return current;
    });
    const onPop = (): void => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to: string): void => {
    const next = normalizePath(to);
    window.history.pushState(null, "", next);
    setPath(next);
    window.scrollTo(0, 0);
  };

  const t = createTranslator(locale);
  const route = parseRoute(path);

  return (
    <AppContextProvider value={{ api, t, locale, navigate }}>
      {route.name === "detail" ? <DetailScreen id={route.id} /> : <MyListingsScreen />}
    </AppContextProvider>
  );
}
