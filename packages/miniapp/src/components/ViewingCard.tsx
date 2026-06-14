/**
 * One viewing row in the Viewings timeline (mock `explore-stage5-3-viewings.html` → `.timeline-item`):
 * a left DATE BUBBLE (big day number + short Thai month) and a card with the listing name, status pill,
 * the scheduled time, the framed price, and a tap-to-open. Authored in Tailwind utilities over the
 * shared `@theme` tokens — NO inline-style objects. Past viewings render muted (`isPast`).
 *
 * Markers for the LIFF-SPA frontend gate: `data-viewing-card` (so the Thai-body line-height invariant
 * scopes here); the Thai listing name + meta are body text the TH-07 net measures. The status pill is
 * exempt (it's a badge — `data-badge`).
 */
import type { Translator } from "@line-robot/ui";
import {
  cardHeadline,
  priceFrameKey,
  priceText,
  viewingDateBubble,
  viewingStatusKey,
  viewingTime,
} from "../lib/display.ts";
import type { ViewingDto } from "../lib/types.ts";

// Status pill colours per viewing status (mock `.pill-*`), paired bg+text from the shared tokens.
// Spelled out (not interpolated) so Tailwind's content scanner keeps them.
const PILL_CLASS: Record<string, string> = {
  requested: "bg-[var(--badge-verified)] text-[var(--badge-verified-text)]",
  confirmed: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  done: "bg-surface-2 text-text-disabled",
  cancelled: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

export function ViewingCard({
  viewing,
  t,
  locale,
  isPast,
  onOpen,
}: {
  viewing: ViewingDto;
  t: Translator;
  locale: "th" | "en";
  isPast: boolean;
  onOpen: () => void;
}) {
  const bubble = viewingDateBubble(viewing.scheduledAt, locale);
  const time = viewingTime(viewing.scheduledAt, locale);
  const headline = cardHeadline(viewing.listing, t);
  const pill = PILL_CLASS[viewing.status] ?? PILL_CLASS.requested;

  return (
    <div className="grid grid-cols-[52px_1fr] gap-x-3" data-viewing-card={viewing.viewingId}>
      {/* Date bubble. */}
      <div className="flex flex-col items-center pt-3.5">
        <div
          className={`flex size-11 shrink-0 flex-col items-center justify-center rounded-md ${
            isPast
              ? "border border-border bg-surface-2 text-text-disabled"
              : "bg-primary-500 text-surface"
          }`}
        >
          <span className="font-latin font-bold text-md leading-none">{bubble.day}</span>
          <span className="font-body-th text-[10px] leading-tight">{bubble.month}</span>
        </div>
      </div>

      {/* Card. */}
      <button
        type="button"
        onClick={onOpen}
        lang="th"
        className={`my-2.5 grid w-full gap-1.5 rounded-lg border border-border bg-surface p-3 text-left font-body-th shadow-sm ${
          isPast ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex-1 font-heading-th font-bold text-sm text-text leading-normal">
            {headline}
          </span>
          <span
            data-badge
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 font-semibold text-xs ${pill}`}
          >
            {t(viewingStatusKey(viewing.status))}
          </span>
        </div>
        {time !== "" && (
          <div className="flex items-center gap-1 text-text-2 text-xs leading-relaxed">
            <span aria-hidden="true">🕐</span>
            <span className="font-latin">{time}</span>
          </div>
        )}
        <div className="font-body-th text-text-2 text-xs leading-relaxed">
          <span>{t(priceFrameKey(viewing.listing.dealType))}</span>{" "}
          <span className="font-latin font-semibold text-text">{priceText(viewing.listing)}</span>
        </div>
      </button>
    </div>
  );
}
