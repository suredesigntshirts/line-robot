import { describe, expect, it } from "vitest";
import { type RedirectInputs, shouldRedirectToEnglish } from "../src/lib/localeRedirect.ts";

const base: RedirectInputs = {
  method: "GET",
  pathname: "/",
  hasLocaleCookie: false,
  preferredLocale: "en",
};

describe("shouldRedirectToEnglish (DF-3)", () => {
  it("redirects a first-time English-preferring visitor on the bare /", () => {
    expect(shouldRedirectToEnglish(base)).toBe(true);
  });

  it("does NOT redirect a Thai-preferring visitor (TH-14 default stays)", () => {
    expect(shouldRedirectToEnglish({ ...base, preferredLocale: "th" })).toBe(false);
  });

  it("does NOT redirect crawlers / neutral clients (no Accept-Language → preferredLocale undefined)", () => {
    // Astro's preferredLocale is `undefined` for a missing / `*` / non-matching Accept-Language (no
    // top match) and "th" only when Thai outranks — neither is "en", so the guard excludes bots and
    // they index Thai at /.
    expect(shouldRedirectToEnglish({ ...base, preferredLocale: undefined })).toBe(false);
    expect(shouldRedirectToEnglish({ ...base, preferredLocale: "th" })).toBe(false);
  });

  it("does NOT loop: a return visit with the locale cookie passes through", () => {
    expect(shouldRedirectToEnglish({ ...base, hasLocaleCookie: true })).toBe(false);
  });

  it("only touches the bare / — never /en/, sub-paths, or listing pages", () => {
    expect(shouldRedirectToEnglish({ ...base, pathname: "/en/" })).toBe(false);
    expect(shouldRedirectToEnglish({ ...base, pathname: "/properties/abc" })).toBe(false);
    expect(shouldRedirectToEnglish({ ...base, pathname: "/sitemap.xml" })).toBe(false);
    expect(shouldRedirectToEnglish({ ...base, pathname: "/favicon.ico" })).toBe(false);
  });

  it("only acts on GET (a form POST to / is never redirected)", () => {
    expect(shouldRedirectToEnglish({ ...base, method: "POST" })).toBe(false);
    expect(shouldRedirectToEnglish({ ...base, method: "HEAD" })).toBe(false);
  });
});
