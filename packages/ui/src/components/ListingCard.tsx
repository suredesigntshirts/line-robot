import type { Listing } from "@line-robot/domain";
import type { Translator, UiLocale } from "../i18n/index.ts";
import type { CardView } from "../view/toCardView.ts";
import { PriceDisplay } from "./PriceDisplay.tsx";
import { StatusBadge } from "./StatusBadge.tsx";

interface ListingCardProps {
  listing: Listing;
  view: CardView;
  verified?: boolean;
  monthlyRent?: number | null;
  /** Poster display name — the human trust signal (CONV-11). */
  postedByName?: string;
  href: string;
  /** TH-08: ICU line-breaking needs lang on the text container. */
  lang?: UiLocale;
  t: Translator;
}

/** Direction-a photo placeholder: a calm camera glyph centred on the gradient (kills blank cards). */
function PhotoPlaceholder() {
  return (
    <span className="absolute inset-0 flex items-center justify-center text-primary-400/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    </span>
  );
}

/**
 * CONV-04/05: price + key specs above the fold, photo-first, clean card. Direction-a "Baania-clean"
 * treatment — gradient+camera placeholder, ขาย/ให้เช่า deal-pill overlaid on the photo, photo-count
 * chip, bold price hierarchy, hover lift. Renders straight from the domain Listing + a CardView (D3.8).
 */
export function ListingCard({
  listing,
  view,
  verified,
  monthlyRent,
  postedByName,
  href,
  lang = "th",
  t,
}: ListingCardProps) {
  const isRent = listing.dealType === "rent";
  const dealLabel = isRent ? t("badge.forRent") : t("badge.forSale");
  return (
    <a
      href={href}
      data-listing-card={listing.id}
      // TH-08: cards may render as standalone Astro islands — carry lang themselves.
      lang={lang}
      className="block overflow-hidden rounded-lg border border-border bg-surface font-body-th text-text no-underline shadow-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
        {view.heroUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- headline is the alt
          <img
            src={view.heroUrl}
            alt={view.headline}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <PhotoPlaceholder />
        )}
        {/* deal-type pill — overlaid top-left (CONV: the deal is legible before the body). */}
        <span
          className={`absolute top-2 left-2 inline-flex items-center rounded-full border px-2 py-px font-body-th font-bold text-[11px] backdrop-blur-sm ${
            isRent
              ? "border-[var(--badge-owner)] bg-white/90 text-[var(--badge-owner-text)]"
              : "border-primary-200 bg-white/90 text-primary-600"
          }`}
        >
          {dealLabel}
        </span>
        {view.photoCount > 0 && (
          <span className="absolute right-2 bottom-2 inline-flex items-center rounded-sm bg-black/75 px-2 py-px font-latin text-white text-xs">
            {t("listing.photos", { count: view.photoCount })}
          </span>
        )}
      </div>
      <div className="grid gap-1.5 px-3 pt-2.5 pb-3">
        <StatusBadge listing={listing} verified={verified} t={t} />
        {/* Heading (loopless Noto, TH-13) — leading-normal (1.5) keeps Thai upper/lower vowels clear. */}
        <div className="line-clamp-2 font-heading-th font-semibold text-sm text-text leading-normal">
          {view.headline}
        </div>
        <PriceDisplay listing={listing} monthlyRent={monthlyRent} t={t} />
        {/* TH-06/07: Thai body lines are ≥13px (text-sm) with leading-relaxed (≥1.6) — the text-*
            utilities pin line-height, so it's set explicitly (theme: --text-xs is Latin/numeral-only). */}
        {view.specLine && (
          <div className="text-text-2 text-sm leading-relaxed">{view.specLine}</div>
        )}
        {/* CONV-08: distance from the search point on a radius search — the reason this card is here. */}
        {view.distanceLine && (
          <div className="text-primary-700 text-sm leading-relaxed">{view.distanceLine}</div>
        )}
        {view.locationLine && (
          <div className="truncate text-text-disabled text-sm leading-relaxed">
            {view.locationLine}
          </div>
        )}
        <div className="flex justify-between gap-2 text-text-disabled text-sm leading-relaxed">
          {/* CONV-11: a named human, not an anonymous listing. */}
          {postedByName && (
            <span className="truncate">{t("listing.postedBy", { name: postedByName })}</span>
          )}
          {/* CONV-03: freshness is visible, stale listings can't hide. */}
          <span data-freshness className="whitespace-nowrap">
            {t("listing.updated", { date: view.updatedAtIso.slice(0, 10) })}
          </span>
        </div>
      </div>
    </a>
  );
}
