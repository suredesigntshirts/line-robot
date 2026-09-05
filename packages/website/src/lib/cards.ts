import type { PublicCardRow } from "@line-robot/db";
import { type Translator, toCardView, type UiLocale } from "@line-robot/ui";
import { presignThumbs } from "./media.ts";
import { localePath } from "./site.ts";

/** A public card row with its hero thumb already presigned (SSR is async; the card render isn't). */
export type CardRow = PublicCardRow & { heroUrl: string | null };

/** The poster's display name for the UI, or null when it is an internal pseudo-owner id. Listings
 * ingested from a LINE group before their poster claimed them are owned by a placeholder user whose
 * display name is the raw `group#…` / `user#…` subject — never a human name, so never shown. */
export function displayPosterName(name: string | null | undefined): string | null {
  const n = (name ?? "").trim();
  if (n === "" || /^(group|user|room)#/i.test(n)) return null;
  return n;
}

/** Presign every row's hero thumb in parallel (null → the card's placeholder). */
export async function withHeroUrls(rows: PublicCardRow[]): Promise<CardRow[]> {
  const urls = await presignThumbs(rows.map((r) => r.heroThumbKey));
  return rows.map((r, i) => ({ ...r, heroUrl: urls[i] ?? null }));
}

/** CONV-08: a card's distance from the search point. Sub-km in metres (rounded to 50 m — false
 * precision otherwise); ≥1 km in km to one decimal. Round to 50 m FIRST so 975–999 m reads "1.0 km". */
export function distanceLabel(t: Translator, distanceM: number | null): string {
  if (distanceM === null) return "";
  const rounded50 = Math.round(distanceM / 50) * 50;
  if (rounded50 < 1000) return t("listing.distanceM", { m: rounded50 });
  return t("listing.distanceKm", { km: (distanceM / 1000).toFixed(1) });
}

/** The ONE mapping from a public card row to `ListingCard` props — home, browse and "similar" all
 * render through it so the card reads identically everywhere. */
export function listingCardProps(row: CardRow, locale: UiLocale, t: Translator) {
  const { listing } = row;
  return {
    listing,
    view: toCardView({
      listing,
      headline: row.headline,
      heroUrl: row.heroUrl,
      photoCount: row.photoCount,
      bedroomsLabel:
        listing.bedrooms === null ? "" : t("listing.bedrooms", { count: listing.bedrooms }),
      bathroomsLabel:
        listing.bathrooms === null ? "" : t("listing.bathrooms", { count: listing.bathrooms }),
      conditionLabel:
        listing.saleCondition === "unknown" ? "" : t(`condition.${listing.saleCondition}`),
      distanceLabel: distanceLabel(t, row.distanceM),
    }),
    monthlyRent: row.monthlyRent,
    postedByName: displayPosterName(row.posterName) ?? undefined,
    href: localePath(locale, `/properties/${listing.id}`),
    lang: locale,
    t,
  };
}
