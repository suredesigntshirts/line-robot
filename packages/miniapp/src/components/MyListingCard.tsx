/**
 * The CRM listing card (my-listings). Mock-faithful to `explore-stage5-2-mylistings.html` → `.crm-card`:
 * a horizontal thumbnail + info block (lifecycle badge row, 2-line title, bold price, muted meta line),
 * a left status accent, and tap-to-open. Authored in Tailwind utilities reading the shared `@theme`
 * tokens — NOT the domain-entity-driven shared `ListingCard` (which needs ~40 Listing fields the slim
 * api card DTO doesn't carry) and NOT the inline-styled shared `Gallery`.
 *
 * Markers for the LIFF-SPA frontend gate: `data-listing-card` (so the Thai-body line-height invariant
 * scopes here) on the card; the Thai title/meta are body text the TH-07 net measures.
 */
import type { Translator } from "@line-robot/ui";
import {
  cardHeadline,
  type LifecycleKind,
  lifecycleKind,
  locationLine,
  priceText,
  propertyTypeKey,
} from "../lib/display.ts";
import type { ListingCardDto } from "../lib/types.ts";
import { HouseIcon } from "./icons.tsx";
import { LifecycleBadge } from "./LifecycleBadge.tsx";

// Left-accent colour per lifecycle (mock: .status-active/.status-offer/.status-draft/.status-closed).
const ACCENT: Record<LifecycleKind, string> = {
  active: "border-l-[3px] border-l-[var(--color-success)]",
  offer: "border-l-[3px] border-l-[var(--badge-reserved-text)]",
  draft: "border-l-[3px] border-l-[var(--color-text-disabled)]",
  sold: "border-l-[3px] border-l-[var(--color-danger)]",
  rented: "border-l-[3px] border-l-[var(--color-danger)]",
  withdrawn: "border-l-[3px] border-l-[var(--color-text-disabled)]",
};

export function MyListingCard({
  listing,
  t,
  onOpen,
}: {
  listing: ListingCardDto;
  t: Translator;
  onOpen: () => void;
}) {
  const kind = lifecycleKind(listing);
  const isRent = listing.dealType === "rent";
  const headline = cardHeadline(listing, t);
  const loc = locationLine(listing);
  const ptype = t(propertyTypeKey(listing.propertyType));
  const closed = kind === "sold" || kind === "rented";
  // A rental shows its rent (now on the card DTO) with the per-month frame; a sale shows priceThb.
  const showRentTrailer = isRent && listing.monthlyRent !== null;

  return (
    <button
      type="button"
      data-listing-card={listing.id}
      onClick={onOpen}
      lang="th"
      className={`flex w-full overflow-hidden rounded-lg border border-border bg-surface text-left font-body-th text-text shadow-sm transition-shadow hover:shadow-md ${ACCENT[kind]}`}
    >
      {/* Thumbnail (gradient + camera/home glyph, or the presigned hero). */}
      <div
        className={`relative flex aspect-[4/3] w-24 shrink-0 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-primary-300 ${
          closed ? "opacity-75 grayscale" : ""
        }`}
      >
        {listing.heroUrl ? (
          <img
            src={listing.heroUrl}
            alt={headline}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <HouseIcon />
        )}
      </div>

      {/* Info block. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <LifecycleBadge kind={kind} t={t} />
        </div>
        {/* Title — heading font, 2-line clamp (TH-13 loopless Noto). */}
        <div
          className={`line-clamp-2 font-heading-th font-semibold text-sm leading-normal ${
            closed ? "text-text-2" : "text-text"
          }`}
        >
          {headline}
        </div>
        {/* Price — Latin numerals, bold; a rental trails with the ค่าเช่า/เดือน frame (MKT-03). */}
        <div className="font-latin font-bold text-text text-md leading-tight tracking-tight">
          {priceText(listing)}
          {showRentTrailer && (
            <span className="ml-1 font-body-th font-normal text-text-2 text-xs leading-relaxed">
              {t("listing.priceMonthly")}
            </span>
          )}
        </div>
        {/* Meta — property type + location (muted body text). The "📍" pin matches the mock. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-text-disabled text-xs leading-relaxed">
          <span>{ptype}</span>
          {loc !== "" && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{`📍 ${loc}`}</span>
            </>
          )}
        </div>
        {/* LEGAL-06 (register §4): the poster-provided/verify-independently line is required ON CARDS —
            it earns its place on saved/third-party cards (it reads slightly redundant on the owner's own
            card; that owner-own nuance is queued as a founder polish call). data-th-content → TH-07 net. */}
        <div className="font-body-th text-text-disabled text-xs leading-relaxed" data-th-content>
          {t("legal.posterProvided")}
        </div>
      </div>
    </button>
  );
}
