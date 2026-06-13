import type { PublicListingDetail } from "@line-robot/db";

/**
 * Serialize for inline <script> injection. JSON.stringify does NOT escape "<",
 * and the HTML parser ends a script element at the first "</script" regardless
 * of JSON context — so a hostile listing headline could break out (stored XSS).
 * The < escape is valid JSON and Google parses it fine.
 */
export function safeJsonLdScript(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * schema.org RealEstateListing for the detail page (stage-4 SEO deliverable).
 * Null/absent listing fields are omitted, never emitted as null — Google's
 * Rich Results validator rejects null-valued properties. `imageUrls` (4.1) are
 * the presigned hero-ordered photos; omitted when the listing has no derivative.
 */
export function listingJsonLd(
  detail: PublicListingDetail,
  canonicalUrl: string,
  imageUrls: readonly string[] = [],
): object {
  const { listing } = detail;
  const price = listing.dealType === "rent" ? detail.monthlyRent : listing.priceThb;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: detail.headline,
    ...(detail.description !== "" ? { description: detail.description } : {}),
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    url: canonicalUrl,
    datePosted: listing.createdAt.toISOString(),
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "THB",
            ...(listing.dealType === "rent"
              ? {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price,
                    priceCurrency: "THB",
                    unitText: "MONTH",
                  },
                }
              : {}),
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      ...(listing.tambon !== null ? { streetAddress: listing.tambon } : {}),
      ...(listing.amphoe !== null ? { addressLocality: listing.amphoe } : {}),
      ...(listing.province !== null ? { addressRegion: listing.province } : {}),
      addressCountry: "TH",
    },
    ...(detail.lat !== null && detail.lon !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: detail.lat, longitude: detail.lon } }
      : {}),
    ...(listing.bedrooms !== null ? { numberOfBedrooms: listing.bedrooms } : {}),
    ...(listing.bathrooms !== null ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
    ...(listing.floorAreaSqm !== null
      ? {
          floorSize: { "@type": "QuantitativeValue", value: listing.floorAreaSqm, unitCode: "MTK" },
        }
      : {}),
  };
}
