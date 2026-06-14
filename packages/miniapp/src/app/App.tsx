/**
 * The app shell + History-API router. `liff.init()` has already resolved by the time this mounts
 * (awaited in main.tsx), so it is safe here to read/mutate the URL. No router library — the two
 * frozen route shapes (`/` list, `/p/{id}` detail) are a tiny `parseRoute` switch; pulling in a
 * framework would violate the anti-over-engineering rules.
 *
 * ROUTE-SHAPE FREEZE: `/` = the CRM shell (listings/saved/viewings TABS), `/p/{id}` = detail (plan-17
 * Flex deep links + rich-menu tabs resolve here). The additive routes are `/claim/{id}` (Build C) and
 * `/edit/{id}` (Build D, the owner edit surface) — each extends `parseRoute`'s union + adds a branch
 * to the switch below WITHOUT changing the two frozen shapes. Saved/viewings are tabs within `/`, not
 * routes (the deep links never target them).
 */

import { createTranslator, type UiLocale } from "@line-robot/ui";
import { useEffect, useState } from "react";
import type { ApiClient } from "../lib/api.ts";
import { normalizePath, parseRoute, resolveInitialPath } from "../lib/deeplink.ts";
import type { LiffProfile } from "../lib/liff.ts";
import { ClaimScreen } from "../screens/ClaimScreen.tsx";
import { DetailScreen } from "../screens/DetailScreen.tsx";
import { EditScreen } from "../screens/EditScreen.tsx";
import { MyListingsScreen } from "../screens/MyListingsScreen.tsx";
import { AppContextProvider } from "./context.ts";

export interface AppProps {
  readonly api: ApiClient;
  readonly locale: UiLocale;
  /** The viewer's LINE identity for the CRM home header (S5-5). Optional — undefined renders the
   * initial-based avatar fallback. */
  readonly profile?: LiffProfile;
}

export function App({ api, locale, profile }: AppProps) {
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
    <AppContextProvider value={{ api, t, locale, navigate, profile }}>
      {route.name === "detail" ? (
        <DetailScreen id={route.id} />
      ) : route.name === "claim" ? (
        <ClaimScreen id={route.id} />
      ) : route.name === "edit" ? (
        <EditScreen id={route.id} />
      ) : (
        <MyListingsScreen />
      )}
    </AppContextProvider>
  );
}
