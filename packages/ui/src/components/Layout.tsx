import type { ReactNode } from "react";
import type { UiLocale } from "../i18n/index.ts";

/**
 * Mobile-first page shell — verified at 360–390px (TH-09). Sets `lang` so the browser applies Thai
 * ICU line-breaking (TH-08); hosts must ALSO set <html lang> at the document level.
 */
export function Screen({ children, lang = "th" }: { children: ReactNode; lang?: UiLocale }) {
  return (
    <div lang={lang} className="min-h-dvh bg-bg font-body-th text-text">
      <div className="mx-auto grid max-w-[480px] gap-4 p-4">{children}</div>
    </div>
  );
}

/** Card grid: responsive (single column on phones → fills with ~280px cards as width allows). Not an
 * app-only fixed 2-up — desktop gets a denser grid, mobile a comfortable single column (TH-09/11). */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
      {children}
    </div>
  );
}
