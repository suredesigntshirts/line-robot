import type { PublicCardRow } from "@line-robot/db";
import {
  CardGrid,
  createTranslator,
  EmptyState,
  ListingCard,
  toCardView,
  type UiLocale,
} from "@line-robot/ui";
import type { BrowseQuery } from "../lib/browse.ts";
import { browseQueryString } from "../lib/browse.ts";

/** A card row with its hero thumb already presigned by the page (SSR is async, the card isn't). */
export type CardRow = PublicCardRow & { heroUrl: string | null };

interface BrowseResultsProps {
  rows: CardRow[];
  total: number;
  query: BrowseQuery;
  pageSize: number;
  locale: UiLocale;
  /** "" for th, "/en" for en — prefixes every internal link. */
  basePath: string;
}

/** Server-rendered listing grid + pagination (no hydration — links do the work). */
export function BrowseResults({
  rows,
  total,
  query,
  pageSize,
  locale,
  basePath,
}: BrowseResultsProps) {
  const t = createTranslator(locale);
  if (rows.length === 0) return <EmptyState t={t} />;

  const lastPage = Math.max(Math.ceil(total / pageSize), 1);
  const pageLink = (page: number) => `${basePath}/${browseQueryString({ ...query, page })}`;

  return (
    <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
      <span style={{ color: "var(--color-text-2)", fontSize: "var(--text-sm)" }}>
        {t("pager.count", { total })}
      </span>
      <CardGrid>
        {rows.map(({ listing, headline, photoCount, monthlyRent, posterName, heroUrl }) => (
          <ListingCard
            key={listing.id}
            postedByName={posterName || undefined}
            listing={listing}
            view={toCardView({
              listing,
              headline,
              heroUrl, // presigned 640px thumb (4.1); null → ListingCard's clean placeholder
              photoCount,
              bedroomsLabel:
                listing.bedrooms === null ? "" : t("listing.bedrooms", { count: listing.bedrooms }),
              bathroomsLabel:
                listing.bathrooms === null
                  ? ""
                  : t("listing.bathrooms", { count: listing.bathrooms }),
              // COMP-06 subtle card meta; "" when unstated → omitted from the spec line.
              conditionLabel:
                listing.saleCondition === "unknown" ? "" : t(`condition.${listing.saleCondition}`),
            })}
            monthlyRent={monthlyRent}
            href={`${basePath}/properties/${listing.id}`}
            lang={locale}
            t={t}
          />
        ))}
      </CardGrid>
      <p style={{ color: "var(--color-text-2)", fontSize: "var(--text-xs)", margin: 0 }}>
        {t("legal.posterProvided")}
      </p>
      <nav style={{ display: "flex", gap: "var(--spacing-3)", justifyContent: "center" }}>
        {query.page > 1 && (
          <a href={pageLink(query.page - 1)} rel="prev">
            ← {t("pager.prev")}
          </a>
        )}
        <span style={{ color: "var(--color-text-2)" }}>
          {query.page} / {lastPage}
        </span>
        {query.page < lastPage && (
          <a href={pageLink(query.page + 1)} rel="next">
            {t("pager.next")} →
          </a>
        )}
      </nav>
    </div>
  );
}
