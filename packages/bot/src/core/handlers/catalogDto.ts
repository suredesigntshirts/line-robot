/**
 * Pure `Property → JSON DTO` mappers for the mini-app read API. They reuse the same display helpers
 * as the Flex {@link ./views} (title, price, status badge, area, maps link) so the webview and the
 * chat cards never drift on how a listing reads. No IO here — the presigned photo/hero URLs are
 * attached by {@link ../../app/readApiHandler} (which has the signer); these mappers stay
 * unit-testable in isolation.
 */
import type { PhotoDto, PropertyDetailDto, PropertyListDto } from "@line-robot/shared";
import type { Property } from "../domain/catalog.js";
import { area, formatPrice, mapsUri, propertyTitle, statusBadge } from "./views.js";

// The DTO contract lives in the shared kernel; the mappers below produce these exact shapes. Re-export
// so readApiHandler + tests keep importing these from the catalogDto barrel.
export type { PhotoDto, PropertyDetailDto, PropertyListDto };

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
