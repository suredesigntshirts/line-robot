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

/**
 * CONV-04/05: price + key specs above the fold, photo-first, clean card.
 * Renders straight from the domain Listing + a derived CardView (D3.8).
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
  return (
    <a
      href={href}
      data-listing-card={listing.id}
      // TH-08: cards may render as standalone Astro islands — carry lang themselves.
      lang={lang}
      style={{
        display: "block",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        textDecoration: "none",
        color: "var(--color-text)",
        fontFamily: "var(--font-body-th)",
        lineHeight: "var(--leading-body)",
      }}
    >
      <div
        style={{ position: "relative", aspectRatio: "4 / 3", background: "var(--color-surface-2)" }}
      >
        {view.heroUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- headline is the alt
          <img
            src={view.heroUrl}
            alt={view.headline}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : null}
        {view.photoCount > 0 && (
          <span
            style={{
              position: "absolute",
              right: "var(--spacing-2)",
              bottom: "var(--spacing-2)",
              background: "var(--color-text)",
              color: "var(--color-surface)",
              borderRadius: "var(--radius-sm)",
              padding: "0 var(--spacing-2)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-latin)",
            }}
          >
            {t("listing.photos", { count: view.photoCount })}
          </span>
        )}
      </div>
      <div style={{ padding: "var(--spacing-3)", display: "grid", gap: "var(--spacing-2)" }}>
        <StatusBadge listing={listing} verified={verified} t={t} />
        <div
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 600,
            fontFamily: "var(--font-heading-th)",
            // COPY-03/TH-08: Thai wraps, never truncates mid-grapheme.
            wordBreak: "normal",
            overflowWrap: "anywhere",
          }}
        >
          {view.headline}
        </div>
        <PriceDisplay listing={listing} monthlyRent={monthlyRent} t={t} />
        {view.locationLine && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
            {view.locationLine}
          </div>
        )}
        {/* CONV-08: distance from the search point on a radius search — the reason this card is here. */}
        {view.distanceLine && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-primary-700)" }}>
            {view.distanceLine}
          </div>
        )}
        {view.specLine && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
            {view.specLine}
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--spacing-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-2)",
          }}
        >
          {/* CONV-11: a named human, not an anonymous listing. */}
          {postedByName && <span>{t("listing.postedBy", { name: postedByName })}</span>}
          {/* CONV-03: freshness is visible, stale listings can't hide. */}
          <span data-freshness>
            {t("listing.updated", { date: view.updatedAtIso.slice(0, 10) })}
          </span>
        </div>
      </div>
    </a>
  );
}
