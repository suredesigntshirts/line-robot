import type { Translator } from "../i18n/index.ts";

interface LineCtaButtonProps {
  /** LINE deep link (line.me / LIFF URL) — the PRIMARY action (CONV-06). */
  lineHref: string;
  /** Phone number for the secondary tel: action (CONV-09). */
  phone?: string | null;
  t: Translator;
}

// Shared CTA shape (direction-a btn): full-width-ish, bold, rounded-md.
const BASE =
  "inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 font-body-th font-semibold text-base no-underline transition-opacity";

/**
 * CONV-06: "Chat on LINE" is the primary CTA — this market closes in chat, not in enquiry forms.
 * The LINE button wears the LINE brand (green + white) by design (FOUNDER-QUEUE: LINE's own
 * white-on-green is below WCAG-AA but is the brand standard — a deliberate brand exception, so it is
 * NOT held to assertCtaContrast). Phone is the visible secondary (CONV-09), never an email form.
 * Stateless: hrefs only, no fetch (D3.9).
 */
export function LineCtaButton({ lineHref, phone, t }: LineCtaButtonProps) {
  return (
    <div className="flex gap-2">
      <a
        href={lineHref}
        data-cta="line"
        className={`${BASE} bg-line text-line-text hover:opacity-90`}
      >
        {t("cta.chatLine")}
      </a>
      {phone && (
        <a
          href={`tel:${phone.replaceAll(/[^+\d]/g, "")}`}
          data-cta="phone"
          className={`${BASE} border border-border-2 bg-surface text-text hover:opacity-90`}
        >
          {t("cta.call")}
        </a>
      )}
    </div>
  );
}
