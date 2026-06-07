/**
 * The single canonical map from one extracted property (port type, sentinel-filled) to the
 * extraction-derived slice of a {@link PropertyUpsert}. Both the ingestion sweep and the interactive
 * edit-reply handler call this so a field/schema change is one edit. Sentinels (`""` / `[]` / `null`)
 * become `undefined` (set-if-present, never clobber). The caller layers on the non-extracted fields
 * (`propertyId`, `updatedAt`/`lastActivityAt`, `mapUrl`, `photos`, the stored `chanote`, origin).
 */
import type { Chanote, PropertyUpsert } from "../domain/catalog.js";
import { emptyToUndef, listToUndef, nullToUndef } from "../domain/sentinel.js";
import type { ExtractedProperty } from "../ports/extraction.js";

/** The extraction-derived fields of an upsert: everything mapped from {@link ExtractedProperty},
 * minus the caller-owned `propertyId`. */
export type ExtractedUpsertFields = Omit<PropertyUpsert, "propertyId">;

/**
 * Map an extracted property to its upsert fields. When `chanote` is supplied (the ingestion sweep
 * path, which OCR'd a title deed this batch), its location fields backfill `district` / `subdistrict`
 * / `province` / `landArea` whenever the chat text didn't state them. The edit-reply path passes no
 * `chanote`, so no backfill is applied — preserving the existing per-path behaviour exactly.
 */
export function extractedToBaseUpsert(
  e: ExtractedProperty,
  chanote?: Chanote,
): ExtractedUpsertFields {
  return {
    normalizedAddress: emptyToUndef(e.normalizedAddress),
    rawAddresses: emptyToUndef(e.rawAddress) ? [e.rawAddress] : undefined,
    projectName: emptyToUndef(e.projectName),
    lat: nullToUndef(e.lat),
    long: nullToUndef(e.long),
    // Backfill location from the title deed when the chat text didn't state it (sweep only).
    district: emptyToUndef(e.district) ?? chanote?.district,
    subdistrict: emptyToUndef(e.subdistrict) ?? chanote?.subdistrict,
    province: emptyToUndef(e.province) ?? chanote?.province,
    propertyType: emptyToUndef(e.propertyType),
    status: emptyToUndef(e.status),
    askingPrice: nullToUndef(e.askingPrice),
    currency: emptyToUndef(e.currency),
    tags: listToUndef(e.tags),
    bedrooms: nullToUndef(e.bedrooms),
    bathrooms: nullToUndef(e.bathrooms),
    usableAreaSqm: nullToUndef(e.usableAreaSqm),
    landArea: emptyToUndef(e.landArea) ?? chanote?.landArea,
    floors: nullToUndef(e.floors),
    furnishing: emptyToUndef(e.furnishing),
    notes: emptyToUndef(e.notes),
    listingType: emptyToUndef(e.listingType),
    rentPrice: nullToUndef(e.rentPrice),
    contact: emptyToUndef(e.contact),
    source: emptyToUndef(e.source),
  };
}
