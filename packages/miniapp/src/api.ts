/**
 * Thin client for the read-api Lambda. Every request carries the LIFF ID token as a Bearer header;
 * the Function URL base is baked at build time (`VITE_READ_API_URL`). A non-2xx throws {@link
 * ApiError} carrying the status so screens can show 401 (re-open in LINE) vs 404 (gone) vs other.
 */
import type { PropertyDetail, PropertyListItem, UpcomingItem } from "./types.js";

const BASE = (import.meta.env.VITE_READ_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`read-api responded ${status}`);
    this.name = "ApiError";
  }
}

async function get<T>(path: string, idToken: string): Promise<T> {
  const response = await fetch(BASE + path, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return (await response.json()) as T;
}

export const api = {
  myProperties: (idToken: string): Promise<PropertyListItem[]> =>
    get<PropertyListItem[]>("/me/properties", idToken),
  property: (id: string, idToken: string): Promise<PropertyDetail> =>
    get<PropertyDetail>(`/properties/${encodeURIComponent(id)}`, idToken),
  upcoming: (idToken: string): Promise<UpcomingItem[]> =>
    get<UpcomingItem[]>("/me/upcoming", idToken),
};
