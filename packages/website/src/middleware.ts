import { defineMiddleware } from "astro:middleware";
import { LOCALE_COOKIE, shouldRedirectToEnglish } from "./lib/localeRedirect.ts";

// DF-3 Accept-Language soft redirect. Thai stays the default + canonical (TH-14): `/` always *is*
// the Thai homepage and its canonical/hreflang are unchanged. This only softly sends a first-time
// visitor whose browser explicitly prefers English to the English mirror once. The decision (and
// the reasoning for why it can't loop and won't redirect crawlers) lives in lib/localeRedirect.ts;
// this is the thin glue: read the request, set the guard cookie, 302.
export const onRequest = defineMiddleware((context, next) => {
  const { request, url, cookies, preferredLocale } = context;

  if (
    shouldRedirectToEnglish({
      method: request.method,
      pathname: url.pathname,
      hasLocaleCookie: cookies.has(LOCALE_COOKIE),
      preferredLocale,
    })
  ) {
    // Remember the decision so a return visit to `/` (or a back-nav from `/en/`) isn't re-bounced.
    cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
    });
    return context.redirect("/en/", 302);
  }

  return next();
});
