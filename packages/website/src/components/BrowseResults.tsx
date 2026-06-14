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

  // CONV-08: a card's distance from the search point on a radius search. Sub-km reads in metres
  // (rounded to 50 m — false precision otherwise); ≥1 km in km to one decimal. Round to 50 m FIRST
  // so 975-999 m crosses to "1.0 km" rather than rendering an odd "1000 m".
  const distanceLabel = (distanceM: number | null): string => {
    if (distanceM === null) return "";
    const rounded50 = Math.round(distanceM / 50) * 50;
    if (rounded50 < 1000) return t("listing.distanceM", { m: rounded50 });
    return t("listing.distanceKm", { km: (distanceM / 1000).toFixed(1) });
  };

  return (
    <div className="grid gap-4">
      <CardGrid>
        {rows.map(
          ({ listing, headline, photoCount, monthlyRent, posterName, heroUrl, distanceM }) => (
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
                  listing.bedrooms === null
                    ? ""
                    : t("listing.bedrooms", { count: listing.bedrooms }),
                bathroomsLabel:
                  listing.bathrooms === null
                    ? ""
                    : t("listing.bathrooms", { count: listing.bathrooms }),
                // COMP-06 subtle card meta; "" when unstated → omitted from the spec line.
                conditionLabel:
                  listing.saleCondition === "unknown"
                    ? ""
                    : t(`condition.${listing.saleCondition}`),
                // CONV-08: distance from the search point (radius search only).
                distanceLabel: distanceLabel(distanceM),
              })}
              monthlyRent={monthlyRent}
              href={`${basePath}/properties/${listing.id}`}
              lang={locale}
              t={t}
            />
          ),
        )}
      </CardGrid>
      <p className="m-0 font-body-th text-sm text-text-2 leading-relaxed">
        {t("legal.posterProvided")}
      </p>
      <nav className="flex items-center justify-center gap-4 font-body-th">
        {query.page > 1 && (
          <a href={pageLink(query.page - 1)} rel="prev" className="font-semibold text-primary-600">
            ← {t("pager.prev")}
          </a>
        )}
        <span className="text-sm text-text-2 leading-relaxed">
          {query.page} / {lastPage}
        </span>
        {query.page < lastPage && (
          <a href={pageLink(query.page + 1)} rel="next" className="font-semibold text-primary-600">
            {t("pager.next")} →
          </a>
        )}
      </nav>
    </div>
  );
}
