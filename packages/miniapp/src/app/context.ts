/**
 * App-wide dependencies (api client + translator + locale + navigate), provided once at the root and
 * read by the screens via a hook. Injected (not module globals) so the unit tests + the e2e harness
 * can supply a fixture api client and a stub translator without touching the LIFF SDK. Small + flat
 * (anti-over-engineering): one context, no provider-per-concern ceremony.
 */

import type { Translator, UiLocale } from "@line-robot/ui";
import { createContext, useContext } from "react";
import type { ApiClient } from "../lib/api.ts";
import type { LiffProfile } from "../lib/liff.ts";

export interface AppCtx {
  readonly api: ApiClient;
  readonly t: Translator;
  readonly locale: UiLocale;
  /** History-API navigation (pushState + re-render). The detail screen + cards call it. */
  readonly navigate: (path: string) => void;
  /** The viewer's LINE identity for the CRM home header (S5-5). Undefined when unavailable (opened
   * outside LINE / no `profile` scope) — the header then renders an initial-based avatar fallback. */
  readonly profile?: LiffProfile;
}

const Ctx = createContext<AppCtx | null>(null);
export const AppContextProvider = Ctx.Provider;

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (ctx === null) {
    throw new Error("useApp() must be used within <AppContextProvider>");
  }
  return ctx;
}
