/**
 * A terminal OUTCOME panel — a tinted glyph ring, a COPY-07 title + body, and a single solid CTA. The
 * one shared component the claim flow (published / kept-private / already-claimed / failed) and the edit
 * flow (saved / not-owner) both render (it was byte-identical in both, so it lives here once). `tone`
 * colours only the glyph ring; the CTA is the shared `primaryButtonClass` (so the WCAG-AA contrast net
 * verifies it, both modes, via `data-cta-solid`).
 *
 * Markers: `data-th-content` (the TH-07 Thai line-height net) + `data-cta-solid` on the CTA. `data-state`
 * lets the e2e gate locate an error outcome (danger) vs a calm one.
 */
import { primaryButtonClass } from "@line-robot/ui";

export type OutcomeTone = "success" | "warn" | "danger";

// Per-tone glyph-ring colours (paired border+bg from the shared @theme tokens). Spelled out (not
// interpolated) so Tailwind's content scanner keeps them.
const RING: Record<OutcomeTone, string> = {
  success: "border-success bg-success-bg",
  warn: "border-[var(--badge-owner-text)] bg-[var(--badge-owner)]",
  danger: "border-danger bg-danger-bg",
};

export function Outcome({
  tone,
  glyph,
  title,
  body,
  ctaLabel,
  onCta,
}: {
  tone: OutcomeTone;
  glyph: string;
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <article
      className="grid justify-items-center gap-3 py-8 text-center"
      lang="th"
      data-th-content
      data-state={tone === "danger" ? "error" : "outcome"}
    >
      <span
        aria-hidden="true"
        className={`flex size-14 items-center justify-center rounded-full border-2 text-2xl ${RING[tone]}`}
      >
        {glyph}
      </span>
      <h1 className="m-0 font-heading-th font-bold text-lg text-text leading-snug">{title}</h1>
      <p className="m-0 max-w-[20rem] font-body-th text-base text-text-2 leading-relaxed">{body}</p>
      <button type="button" data-cta-solid onClick={onCta} className={primaryButtonClass}>
        {ctaLabel}
      </button>
    </article>
  );
}
