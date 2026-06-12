import { en } from "./en.ts";
import { type MessageKey, th } from "./th.ts";

export type { MessageKey };
export type UiLocale = "th" | "en";

/** th default (DF-3); designed-for-N: add `my.ts`, extend the union. */
const CATALOGS: Record<UiLocale, Record<MessageKey, string>> = { th, en };

export type Translator = (key: MessageKey, vars?: Record<string, string | number>) => string;

/**
 * D3.4: a plain function, no React context — context does not cross Astro
 * islands (TECH-08/AP-4). Pass the translator (or locale) down as a prop.
 * Interpolation is `{var}` only; a missing key is a compile-time error.
 */
export function createTranslator(locale: UiLocale = "th"): Translator {
  const catalog = CATALOGS[locale];
  return (key, vars) => {
    const template = catalog[key];
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
      name in vars ? String(vars[name]) : whole,
    );
  };
}
