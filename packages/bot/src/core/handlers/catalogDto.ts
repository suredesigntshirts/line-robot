/**
 * Pure `Property → JSON DTO` mappers for the mini-app read API. They reuse the same display helpers
 * as the Flex {@link ./views} (title, price, status badge, area, maps link) so the webview and the
 * chat cards never drift on how a listing reads. No IO here — the presigned photo/hero URLs are
 * attached by {@link ../../app/readApiHandler} (which has the signer); these mappers stay
 * unit-testable in isolation.
 */
import type { Chanote, Property } from "../domain/catalog.js";
import { area, formatPrice, mapsUri, propertyTitle, statusBadge } from "./views.js";

/** One presigned photo in a detail response (kept in the API's `property → chanote → other` order). */
export interface PhotoDto {
  readonly url: string;
  readonly kind: string;
  readonly label?: string;
}

/** A listing as it appears in the scrollable List screen. `heroUrl` is presigned by the handler;
 * `priceValue`/`updatedAt`/`area`/`propertyType`/`status` back the client-side sort + filter chips,
 * and `search` is the lowercased haystack the search box matches (mirrors `listingsOnRoad`). */
export interface PropertyListDto {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly priceValue?: number;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly area?: string;
  readonly updatedAt?: number;
  /** Lowercased concatenation of address/area/project fields for the free-text search box. */
  readonly search: string;
  /** Presigned hero image (attached by the handler when the listing has a photo). */
  readonly heroUrl?: string;
}

/** A listing's full detail (the Detail/Gallery/Map screen). `photos` is attached by the handler with
 * presigned URLs; everything else is a pure projection of the stored {@link Property}. */
export interface PropertyDetailDto {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly rent?: string;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly usableAreaSqm?: number;
  readonly landArea?: string;
  readonly floors?: number;
  readonly furnishing?: string;
  readonly projectName?: string;
  readonly address?: string;
  readonly area?: string;
  readonly contact?: string;
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly notes?: string;
  readonly chanote?: Chanote;
  readonly lat?: number;
  readonly long?: number;
  readonly mapsUri?: string;
  readonly createdAt?: number;
  readonly updatedAt?: number;
  readonly photos: readonly PhotoDto[];
}

/** Drop keys whose value is `undefined` (or an empty array) so the JSON carries only present fields —
 * the webview renders exactly what we have, same as the Flex cards' `pushRow` omits empties. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

/** Lowercased searchable haystack — the same fields `views`/`catalogAssistant` match a road query on. */
function searchText(p: Property): string {
  return [
    p.normalizedAddress,
    p.projectName,
    p.district,
    p.subdistrict,
    p.province,
    ...(p.rawAddresses ?? []),
  ]
    .filter((s): s is string => s !== undefined && s !== "")
    .join(" ")
    .toLowerCase();
}

export function toListDto(p: Property): PropertyListDto {
  return compact({
    propertyId: p.propertyId,
    title: propertyTitle(p),
    status: p.status,
    statusBadge: statusBadge(p.status),
    price: formatPrice(p.askingPrice, p.currency),
    priceValue: p.askingPrice,
    currency: p.currency,
    propertyType: p.propertyType,
    listingType: p.listingType,
    area: area(p),
    updatedAt: p.lastActivityAt ?? p.updatedAt,
    search: searchText(p),
  }) as PropertyListDto;
}

export function toDetailDto(p: Property): PropertyDetailDto {
  const rent = p.rentPrice !== undefined ? `${formatPrice(p.rentPrice, p.currency)}/mo` : undefined;
  return {
    ...compact({
      propertyId: p.propertyId,
      title: propertyTitle(p),
      status: p.status,
      statusBadge: statusBadge(p.status),
      price: formatPrice(p.askingPrice, p.currency),
      rent,
      currency: p.currency,
      propertyType: p.propertyType,
      listingType: p.listingType,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      usableAreaSqm: p.usableAreaSqm,
      landArea: p.landArea,
      floors: p.floors,
      furnishing: p.furnishing,
      projectName: p.projectName,
      address: p.normalizedAddress,
      area: area(p),
      contact: p.contact,
      source: p.source,
      tags: p.tags,
      notes: p.notes,
      chanote: p.chanote,
      lat: p.lat,
      long: p.long,
      mapsUri: mapsUri(p),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }),
    // photos always present (possibly empty) so the client can branch on length without a guard.
    photos: [],
  } as PropertyDetailDto;
}
