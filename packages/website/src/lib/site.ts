import type { Translator, UiLocale } from "@line-robot/ui";

/**
 * Site-level constants shared by every page: brand, locale paths, the LINE OA link, navigation.
 * The brand name is the working wordmark from the design mockups (DECISIONS.md D29 — no final
 * brand decided yet); every surface reads it from the i18n catalog (`site.name`) so a rename is one
 * edit in packages/ui/src/i18n.
 */

/** "" for th (the default, clean URLs), "/en" for the English mirror. */
export const basePathFor = (locale: UiLocale): string => (locale === "en" ? "/en" : "");

/** Prefix an in-site path with the locale base ("/properties" → "/en/properties" on en). */
export const localePath = (locale: UiLocale, path: string): string => {
  const base = basePathFor(locale);
  return path === "/" ? `${base}/` : `${base}${path}`;
};

/** The SAME page in the other locale (keeps the query string so a filtered browse stays filtered). */
export const alternateLocalePath = (
  currentLocale: UiLocale,
  pathname: string,
  search = "",
): string => {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const target = currentLocale === "en" ? stripped : `/en${stripped === "/" ? "/" : stripped}`;
  return `${target}${search}`;
};

/** Locale from a request pathname ("/en/…" → en). */
export const localeFromPath = (pathname: string): UiLocale =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "th";

/** CONV-06: the founder's LINE Official Account (Pulumi config → LINE_OA_URL env). "" = not configured;
 * surfaces that need it hide their LINE CTA rather than shipping a dead link. */
export const lineOaUrl = (): string =>
  (import.meta.env.LINE_OA_URL as string | undefined) ?? process.env.LINE_OA_URL ?? "";

/** Primary navigation (header + footer share it). Labels are i18n keys. */
export const NAV = [
  { key: "nav.buy", path: "/properties?deal=sale" },
  { key: "nav.rent", path: "/properties?deal=rent" },
  { key: "nav.howItWorks", path: "/how-it-works" },
  { key: "nav.about", path: "/about" },
] as const;

/** "3 listings" / "1 listing" / "3 ประกาศ" — English needs the singular, Thai has no plural. */
export const listingCount = (t: Translator, count: number): string =>
  count === 1 ? t("count.listingOne") : t("count.listings", { count });
