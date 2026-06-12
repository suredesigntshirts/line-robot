import type { Listing } from "@line-robot/domain";
import type { Translator } from "../i18n/index.ts";

interface PriceDisplayProps {
  listing: Pick<
    Listing,
    "dealType" | "priceThb" | "priceNegotiable" | "pricePerWah" | "pricePerSqm" | "propertyType"
  >;
  /** Rentals price on listing_rental.monthly_rent; pass it when dealType=rent. */
  monthlyRent?: number | null;
  t: Translator;
}

const formatThb = (n: number) => `฿${n.toLocaleString("en-US")}`;

/**
 * COPY-06: prices are framed as ASKING prices (ราคาเสนอขาย), never implied
 * appraisals. TH-03: per-area uses Thai units — wah² for land, m² for built.
 */
export function PriceDisplay({ listing, monthlyRent, t }: PriceDisplayProps) {
  const isRent = listing.dealType === "rent";
  const amount = isRent ? (monthlyRent ?? null) : listing.priceThb;
  const frame = isRent ? t("listing.priceMonthly") : t("listing.priceAsking");
  const perArea =
    listing.propertyType === "land" && listing.pricePerWah !== null
      ? `${formatThb(Math.round(listing.pricePerWah))} ${t("listing.pricePerWah")}`
      : listing.pricePerSqm !== null
        ? `${formatThb(Math.round(listing.pricePerSqm))} ${t("listing.pricePerSqm")}`
        : null;

  return (
    <div style={{ fontFamily: "var(--font-body-th)" }}>
      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>{frame}</div>
      <div
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "var(--font-latin)",
        }}
      >
        {amount !== null ? formatThb(amount) : "—"}
        {listing.priceNegotiable && (
          <span
            style={{
              marginLeft: "var(--spacing-2)",
              fontSize: "var(--text-sm)",
              fontWeight: 400,
              color: "var(--color-text-2)",
              fontFamily: "var(--font-body-th)",
            }}
          >
            {t("listing.negotiable")}
          </span>
        )}
      </div>
      {perArea && (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>{perArea}</div>
      )}
    </div>
  );
}
