// DF-3 Accept-Language soft-redirect decision — extracted as a pure function so the loop/SEO/cookie
// guards are unit-testable without the Astro middleware runtime. The middleware (src/middleware.ts)
// is the thin glue that reads the request and acts on this verdict.

export const LOCALE_COOKIE = "locale_pref";

export interface RedirectInputs {
  method: string;
  /** url.pathname */
  pathname: string;
  /** whether the LOCALE_COOKIE is already present (cookies.has) */
  hasLocaleCookie: boolean;
  /** Astro's Accept-Language match against i18n.locales (["th","en"]); "en" only when English is the
   *  top match. A missing / `*` / non-matching header yields `undefined` (no top match), so crawlers
   *  and neutral clients — never being "en" — are never redirected. */
  preferredLocale: string | undefined;
}

/**
 * True iff a first-time visitor on the bare Thai home (`/`) explicitly prefers English and should
 * be softly sent to `/en/`. Thai stays default/canonical (TH-14): we only redirect, never rewrite
 * `/`, and only the bare `/` (GET) is ever a candidate.
 *
 * Loop-safe: once redirected we set LOCALE_COOKIE, so a return visit (or back-nav from `/en/`) to
 * `/` has the cookie and passes through to Thai. SEO-safe: bots send no/`*` Accept-Language → Astro
 * reports `undefined` (no top match) → no redirect; and the redirect is a 302 (the caller never
 * issues a 301).
 */
export function shouldRedirectToEnglish(i: RedirectInputs): boolean {
  return (
    i.method === "GET" && i.pathname === "/" && !i.hasLocaleCookie && i.preferredLocale === "en"
  );
}
