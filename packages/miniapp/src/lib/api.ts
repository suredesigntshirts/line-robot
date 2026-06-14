/**
 * Thin client for the packages/api Lambda (the v2 backend, Build A). Every request carries the LIFF
 * id-token as a Bearer header; the Function URL base is baked at build time (`VITE_API_URL`). A
 * non-2xx throws {@link ApiError} carrying the status so screens can distinguish 401 (re-open in
 * LINE) vs 404 (gone/unauthorized) vs other.
 *
 * Deliberately small + extensible (no premature abstraction — anti-over-engineering rule 3): Build B
 * wires only the two GETs its two screens use. Claim/publish/save/viewings/notes endpoints exist in
 * the api for Build C/D — they are added here as one-line methods over the same `get`/`post`/etc.
 * helpers when those builds land, never a speculative interface now.
 */
import type {
  ListingCardDto,
  ListingDetailDto,
  ListingPatch,
  NoteDto,
  ViewingsDto,
} from "./types.ts";

/** The baked-in api base URL (`VITE_API_URL`), trimmed of any trailing slash. main.tsx binds the
 * production client to this + the LIFF id-token; the e2e harness/tests pass their own base. */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`api responded ${status}`);
    this.name = "ApiError";
  }
}

/** The id-token supplier — injected so the client never imports the LIFF SDK (hexagonal: LIFF stays
 * in liff.ts). In production this is `getIdToken` from liff.ts; tests pass a stub. */
export type TokenSource = () => string | null;

/** Build an api client bound to a base URL + a token source. A factory (not a singleton) so the e2e
 * harness + unit tests can point it at a fixture base and a stub token without touching globals. */
export function createApiClient(base: string, getToken: TokenSource) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    if (token === null) {
      // No id-token → treat as unauthorized without a round-trip (the api would 401 anyway).
      throw new ApiError(401);
    }
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    };
    if (init.body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(base + path, { ...init, headers });
    if (!response.ok) throw new ApiError(response.status);
    return (await response.json()) as T;
  }

  const propertyPath = (id: string): string => `/properties/${encodeURIComponent(id)}`;

  return {
    /** `GET /me/listings` — the home screen's my-listings. */
    myListings: (): Promise<ListingCardDto[]> => request<ListingCardDto[]>("/me/listings"),
    /** `GET /properties/{id}` — the detail + claim screens. */
    listing: (id: string): Promise<ListingDetailDto> => request<ListingDetailDto>(propertyPath(id)),
    /** `POST /properties/{id}/claim` — claim ownership (optimistic lock). Resolves `{status}` on a win
     * (claimed/already_yours); a concurrent/late loser gets a 409 → the client throws ApiError(409),
     * which the claim screen maps to the "already taken" message. */
    claim: (id: string): Promise<{ status: string }> =>
      request<{ status: string }>(`${propertyPath(id)}/claim`, { method: "POST" }),
    /** `POST /properties/{id}/publish` — opt in to public visibility (LEGAL-02 consent). */
    publish: (id: string): Promise<{ status: string }> =>
      request<{ status: string }>(`${propertyPath(id)}/publish`, { method: "POST" }),
    /** `POST /properties/{id}/keep-private` — keep group-private (the default; revokes any consent). */
    keepPrivate: (id: string): Promise<{ status: string }> =>
      request<{ status: string }>(`${propertyPath(id)}/keep-private`, { method: "POST" }),

    // --- Per-user CRM (Stage 5, Build D — D13) ----------------------------------

    /** `GET /me/saved` — the listings the caller saved (card DTOs, each with `savedAt`). */
    saved: (): Promise<ListingCardDto[]> => request<ListingCardDto[]>("/me/saved"),
    /** `POST /properties/{id}/save` — save a listing (idempotent → `{status:"saved"}`). */
    save: (id: string): Promise<{ status: string }> =>
      request<{ status: string }>(`${propertyPath(id)}/save`, { method: "POST" }),
    /** `DELETE /properties/{id}/save` — un-save a listing (`{status:"unsaved"}`). */
    unsave: (id: string): Promise<{ status: string }> =>
      request<{ status: string }>(`${propertyPath(id)}/save`, { method: "DELETE" }),

    /** `GET /me/viewings` — the caller's viewings, split `{upcoming, past}`. */
    viewings: (): Promise<ViewingsDto> => request<ViewingsDto>("/me/viewings"),
    /** `POST /properties/{id}/viewings` — book a viewing at `scheduledAt` (ISO-8601). `201 {viewingId,
     * scheduledAt, status}`; a bad time is `400 invalid_time` → ApiError(400). */
    createViewing: (
      id: string,
      scheduledAt: string,
    ): Promise<{ viewingId: string; scheduledAt: string; status: string }> =>
      request(`${propertyPath(id)}/viewings`, {
        method: "POST",
        body: JSON.stringify({ scheduledAt }),
      }),

    /** `GET /properties/{id}/notes` — the caller's OWN notes on a listing (never another user's). */
    notes: (id: string): Promise<NoteDto[]> => request<NoteDto[]>(`${propertyPath(id)}/notes`),
    /** `POST /properties/{id}/notes` — add a note. `201 {id, body, createdAt}`; an empty body is
     * `400 empty_note` → ApiError(400) (the screen validates client-side too). */
    addNote: (id: string, body: string): Promise<NoteDto> =>
      request<NoteDto>(`${propertyPath(id)}/notes`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),

    /** `PATCH /properties/{id}` — edit an owned listing's fields (NOT edit-by-reply). `200
     * {status:"updated"}`; a non-claimant is `404 not_found`, a malformed body `400 invalid_body`. */
    editListing: (id: string, patch: ListingPatch): Promise<{ status: string }> =>
      request<{ status: string }>(propertyPath(id), {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
