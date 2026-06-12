import type { CSSProperties } from "react";
import type { Translator } from "../i18n/index.ts";

interface LineCtaButtonProps {
  /** LINE deep link (line.me / LIFF URL) — the PRIMARY action (CONV-06). */
  lineHref: string;
  /** Phone number for the secondary tel: action (CONV-09). */
  phone?: string | null;
  t: Translator;
}

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--spacing-2)",
  padding: "var(--spacing-3) var(--spacing-4)",
  borderRadius: "var(--radius-md)",
  fontSize: "var(--text-base)",
  fontWeight: 600,
  fontFamily: "var(--font-body-th)",
  textDecoration: "none",
  minWidth: 0,
};

/**
 * CONV-06: "Chat on LINE" is the primary CTA — this market closes in chat,
 * not in enquiry forms. Phone is the visible secondary (CONV-09), never an
 * email form. Stateless: hrefs only, no fetch (D3.9).
 */
export function LineCtaButton({ lineHref, phone, t }: LineCtaButtonProps) {
  return (
    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
      <a
        href={lineHref}
        data-cta="line"
        style={{
          ...base,
          flex: 1,
          background: "var(--color-line)",
          color: "var(--color-line-text)",
        }}
      >
        {t("cta.chatLine")}
      </a>
      {phone && (
        <a
          href={`tel:${phone.replaceAll(/[^+\d]/g, "")}`}
          data-cta="phone"
          style={{
            ...base,
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border-2)",
          }}
        >
          {t("cta.call")}
        </a>
      )}
    </div>
  );
}
