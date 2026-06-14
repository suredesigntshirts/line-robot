/**
 * The CRM listing card (my-listings) — Stage-5 PHOTO-FORWARD layout. Mock-faithful to the
 * direction-a-baania-clean card language (large 16/10 hero, the deal pill OVERLAID on the photo, a
 * photo-present chip) crossed with explore-stage5-2-mylistings.html's lifecycle treatment (a thick
 * left-accent stripe + the DF-4 lifecycle badge). Authored in Tailwind utilities reading the shared
 * `@theme` tokens — NOT the domain-entity-driven shared `ListingCard` (which needs ~40 Listing fields
 * the slim api card DTO doesn't carry) and NOT the inline-styled shared `Gallery`.
 *
 * Content stays schema-driven: where a listing has NO photo (`heroUrl` absent — common), the hero
 * renders a deliberate empty state (a property-type glyph on a token gradient surface), never an empty
 * box. The slim card DTO carries no photo COUNT, so the chip is a "has photos" indicator (📷 มีรูป),
 * not a fabricated "N รูป" (queued S5-12).
 *
 * Markers for the LIFF-SPA frontend gate: `data-listing-card` (so the Thai-body line-height invariant
 * scopes here) on the card; the Thai title/meta are body text the TH-07 net measures.
 */
import type { Translator } from "@line-robot/ui";
import {
  cardHeadline,
  dealLabelKey,
  type LifecycleKind,
  lifecycleKind,
  locationLine,
  priceText,
  propertyTypeKey,
} from "../lib/display.ts";
import type { ListingCardDto } from "../lib/types.ts";
import { HouseIcon } from "./icons.tsx";
import { LifecycleBadge } from "./LifecycleBadge.tsx";

// Thicker left-accent stripe per lifecycle (S5-5: was 3px → 4px to read as in the mock). Static so
// Tailwind's scanner keeps every class literally.
const ACCENT: Record<LifecycleKind, string> = {
  active: "border-l-4 border-l-[var(--color-success)]",
  offer: "border-l-4 border-l-[var(--badge-reserved-text)]",
  draft: "border-l-4 border-l-[var(--color-text-disabled)]",
  sold: "border-l-4 border-l-[var(--color-danger)]",
  rented: "border-l-4 border-l-[var(--color-danger)]",
  withdrawn: "border-l-4 border-l-[var(--color-text-disabled)]",
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
  // ONE deal-word source (display.ts) shared with the composed headline so the pill can't drift.
  const dealLabel = t(dealLabelKey(listing.dealType));

  return (
    <button
      type="button"
      data-listing-card={listing.id}
      onClick={onOpen}
      lang="th"
      className={`block w-full overflow-hidden rounded-lg border border-border bg-surface text-left font-body-th text-text shadow-sm transition-shadow hover:shadow-md ${ACCENT[kind]}`}
    >
      {/* Photo-forward hero: full-width 16/10, deal pill overlaid top-left, photo-present chip
          bottom-right. No photo → a deliberate property-type glyph on a token gradient surface. */}
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 ${
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
          <span className="absolute inset-0 flex items-center justify-center text-primary-300">
            <HouseIcon size={40} />
          </span>
        )}
        {/* Deal-type pill (ขาย / ให้เช่า) — overlaid, frosted-white on the photo (direction-a). */}
        <span
          data-deal-pill
          className="absolute top-2 left-2 inline-flex items-center rounded-full border border-primary-200 bg-white/90 px-2 py-0.5 font-body-th font-bold text-primary-600 text-xs leading-none backdrop-blur-sm"
        >
          {dealLabel}
        </span>
        {/* Photo-present chip (📷) — only when the listing actually has a photo (no count in the DTO). */}
        {listing.heroUrl && (
          <span
            data-photo-chip
            className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-sm bg-text/75 px-1.5 py-0.5 font-latin font-medium text-white text-xs leading-none"
          >
            <span aria-hidden="true">📷</span>
            {t("crm.hasPhotos")}
          </span>
        )}
      </div>

      {/* Info block. */}
      <div className="flex min-w-0 flex-col gap-1.5 p-3">
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
        <div className="font-latin font-bold text-md text-text leading-tight tracking-tight">
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
