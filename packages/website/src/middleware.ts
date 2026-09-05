import { defineMiddleware } from "astro:middleware";
import { LOCALE_COOKIE, shouldRedirectToEnglish } from "./lib/localeRedirect.ts";
import { isEmptySpec, parseUiSpec, serializeUiSpec, UI_COOKIE, UI_PARAM } from "./lib/variants.ts";

// Two concerns, both thin glue:
//  1. DF-3 Accept-Language soft redirect (Thai stays default + canonical; a first-time visitor whose
//     browser prefers English is sent to /en/ once — the reasoning lives in lib/localeRedirect.ts).
//  2. UI template variants (lib/variants.ts): `?ui=` sets/clears the sticky `ui` cookie; the parsed
//     spec is exposed on Astro.locals for pages to pick their template.
export const onRequest = defineMiddleware((context, next) => {
  const { request, url, cookies, preferredLocale, locals } = context;

  if (
    shouldRedirectToEnglish({
      method: request.method,
      pathname: url.pathname,
      hasLocaleCookie: cookies.has(LOCALE_COOKIE),
      preferredLocale,
    })
  ) {
    cookies.set(LOCALE_COOKIE, "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
    });
    return context.redirect(`/en/${url.search}`, 302);
  }

  const fromQuery = url.searchParams.get(UI_PARAM);
  if (fromQuery !== null) {
    const spec = parseUiSpec(fromQuery);
    if (isEmptySpec(spec)) {
      cookies.delete(UI_COOKIE, { path: "/" });
    } else {
      cookies.set(UI_COOKIE, serializeUiSpec(spec), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
      });
    }
    locals.ui = spec;
    locals.uiFromQuery = true;
  } else {
    locals.ui = parseUiSpec(cookies.get(UI_COOKIE)?.value);
    locals.uiFromQuery = false;
  }

  return next();
});
