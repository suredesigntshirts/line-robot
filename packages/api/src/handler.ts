import type {
  ClaimResult,
  ListingNoteRow,
  MyListingCard,
  PortalListingDetail,
  SavedListingCard,
  UserRow,
  ViewingCard,
  ViewingRow,
} from "@line-robot/db";
import type { Presign } from "./adapters/s3Presigner.ts";
import { bearerToken, type HttpRequest, type HttpResponse, json, parseJsonBody } from "./http.ts";
import type { LineTokenVerifier } from "./ports/lineTokenVerifier.ts";

// The DB seam for the handler. DB is a real seam (named alongside LLM/LINE in the project rules), and
// this interface is what lets the handler be unit-tested as pure logic against a fake — no Postgres,
// the same port-driven pattern the bot's readApiHandler uses. Every member is the matching
// @line-robot/db public-barrel function with its leading `db` bound; the production binding is an
// inline object literal in lambda/api.ts's buildDeps(). The handler reads/writes the catalog ONLY
// through this — never a deep import of schema.ts or another package's internals.
export interface Repo {
  findUserByIdentity(provider: "line", subject: string): Promise<UserRow | undefined>;
  createLineUser(displayName: string, subject: string): Promise<UserRow>;
  getPortalListingDetail(
    id: string,
    callerUserId: string,
  ): Promise<PortalListingDetail | undefined>;
  isGroupMember(groupId: string | null, userId: string): Promise<boolean>;
  listMyListings(userId: string): Promise<MyListingCard[]>;
  claimListing(listingId: string, userId: string): Promise<ClaimResult>;
  publishListing(listingId: string, userId: string, consentVersion: string): Promise<void>;
  keepListingPrivate(listingId: string): Promise<void>;
  updateListingFields(id: string, patch: Record<string, unknown>): Promise<void>;
  updateRentalMonthlyRent(id: string, monthlyRent: number): Promise<void>;
  listSavedListingsForUser(userId: string): Promise<SavedListingCard[]>;
  saveListing(listingId: string, userId: string): Promise<void>;
  unsaveListing(listingId: string, userId: string): Promise<void>;
  listViewingsForUser(
    userId: string,
    now: Date,
  ): Promise<{ upcoming: ViewingCard[]; past: ViewingCard[] }>;
  createViewing(listingId: string, userId: string, scheduledAt: Date): Promise<ViewingRow>;
  listNotesForUserListing(listingId: string, userId: string): Promise<ListingNoteRow[]>;
  addListingNote(listingId: string, userId: string, body: string): Promise<ListingNoteRow>;
}

// The mini-app API handler — independent of the Lambda Function URL plumbing. It turns a LIFF id-token
// (the `Authorization: Bearer …` header) into the caller's LINE user id, resolves that to a Postgres
// user (creating one on first contact), then serves the per-user CRM + claim/publish endpoints over the
// catalog. Provider-agnostic and dependency-injected → fully unit-testable with fakes (no AWS, no
// network, no Postgres). NO @line/liff SDK anywhere — that's the client's concern.
//
// Security: the Function URL is public; EVERY route is gated by id-token verification (`aud` must equal
// our MINI App channel). Per-endpoint authorization is the SECOND gate — detail/edit/publish/notes
// enforce ownership (claimant) or membership (source-group), so listing ids are not freely enumerable.

/** The LEGAL-02 consent version stamped when a listing is published. Bump when the consent copy
 * changes; existing rows keep their stamped version (audit trail). */
const PUBLISH_CONSENT_VERSION = "v1";

export interface Logger {
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export interface ApiDeps {
  readonly repo: Repo;
  readonly verifier: LineTokenVerifier;
  readonly presign: Presign;
  readonly logger: Logger;
  /** Injected clock (epoch ms → Date) so viewing upcoming/past splits are deterministic in tests. */
  readonly now: () => Date;
}

// --- photo presigning -------------------------------------------------------

interface PhotoDto {
  url: string;
  kind: PortalListingDetail["media"][number]["kind"];
  isThumb: boolean;
}

/** Presign one key, swallowing failure (a bad/expired key never 500s the listing — it's dropped). */
async function presignOne(presign: Presign, key: string, logger: Logger): Promise<string | null> {
  try {
    return await presign(key);
  } catch (error) {
    logger.warn("api: presign failed; dropping photo", { s3Key: key, error: String(error) });
    return null;
  }
}

/** Presign a listing's gallery (prefer the 640px derivative, fall back to the original), in hero order. */
async function presignGallery(
  presign: Presign,
  detail: PortalListingDetail,
  logger: Logger,
): Promise<PhotoDto[]> {
  const urls = await Promise.all(
    detail.media.map((m) => presignOne(presign, m.thumbKey ?? m.s3Key, logger)),
  );
  const out: PhotoDto[] = [];
  detail.media.forEach((m, i) => {
    const url = urls[i];
    if (url != null) out.push({ url, kind: m.kind, isThumb: m.thumbKey !== null });
  });
  return out;
}

// --- DTO mappers ------------------------------------------------------------

/** A card row (my-listings / saved): the columns the mini-app list screens render. `monthlyRent` is
 * the rent for a RENT listing (from the rental satellite) so the card can show it — a sale's asking
 * price rides on `priceThb`, and a sale's `monthlyRent` is null. */
function toCardDto(
  listing: PortalListingDetail["listing"],
  heroUrl: string | undefined,
  monthlyRent: number | null,
  extra: Record<string, unknown>,
) {
  return {
    id: listing.id,
    dealType: listing.dealType,
    propertyType: listing.propertyType,
    priceThb: listing.priceThb,
    monthlyRent,
    saleStage: listing.saleStage,
    rentalStatus: listing.rentalStatus,
    province: listing.province,
    amphoe: listing.amphoe,
    ...(heroUrl !== undefined ? { heroUrl } : {}),
    ...extra,
  };
}

// --- authenticated-user resolution ------------------------------------------

/** Resolve the verified LINE user id to a Postgres user, creating one on first contact (D-S1-6). The
 * display name is unknown at this seam (we only have the id-token subject), so a placeholder is used;
 * the bot/profile flow can backfill it later.
 *
 * This is the PORT-layer expression of the same find-or-create the db's `findOrCreateUserByIdentity`
 * does at the adapter layer (the bot sweep uses that directly). The handler stays db-import-free (all
 * DB access through the injectable `Repo` seam), so the race logic lives here in terms of two port
 * calls rather than the single db fn — its explicit race-path is unit-tested below.
 *
 * Race-safe: two concurrent first requests from the same subject both miss the lookup and both try to
 * create. The `user_identity_provider_subject` unique index lets at most one win; the loser's insert
 * throws, so we re-read and use the winner's row instead of 500ing. (The losing transaction may leave
 * an orphaned `user` row with no identity — harmless: it's unreachable, never returned by any identity
 * lookup. A periodic orphan sweep is a later cleanup, not a correctness issue.) */
async function resolveUser(repo: Repo, lineUserId: string): Promise<string> {
  const existing = await repo.findUserByIdentity("line", lineUserId);
  if (existing) return existing.id;
  try {
    const created = await repo.createLineUser("LINE user", lineUserId);
    return created.id;
  } catch (error) {
    const winner = await repo.findUserByIdentity("line", lineUserId);
    if (winner) return winner.id;
    throw error; // a real failure (not a lost create race) — let the handler 500 it.
  }
}

// --- authorization ----------------------------------------------------------

/** A caller may read/act on a listing iff they CLAIMED it OR are a member of its source group. Returns
 * the detail when authorized, or null (the handler maps null to 404 — same for unauthorized + missing,
 * so ids stay non-enumerable). `requireClaimant` tightens it to owner-only (edit/publish). */
async function authorizedListing(
  deps: ApiDeps,
  listingId: string,
  userId: string,
  requireClaimant: boolean,
): Promise<PortalListingDetail | null> {
  const detail = await deps.repo.getPortalListingDetail(listingId, userId);
  if (!detail) return null;
  const isClaimant = detail.listing.claimedByUserId === userId;
  if (requireClaimant) return isClaimant ? detail : null;
  if (isClaimant) return detail;
  const member = await deps.repo.isGroupMember(detail.listing.sourceGroupId, userId);
  return member ? detail : null;
}

// --- endpoint handlers ------------------------------------------------------

async function handleMyListings(deps: ApiDeps, userId: string): Promise<HttpResponse> {
  const cards = await deps.repo.listMyListings(userId);
  const dtos = await Promise.all(
    cards.map(async (c) => {
      const heroUrl = c.heroThumbKey
        ? ((await presignOne(deps.presign, c.heroThumbKey, deps.logger)) ?? undefined)
        : undefined;
      return toCardDto(c.listing, heroUrl, c.monthlyRent, { isPublished: c.isPublished });
    }),
  );
  return json(200, dtos);
}

async function handleDetail(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, false);
  if (!detail) return json(404, { error: "not_found" });
  const photos = await presignGallery(deps.presign, detail, deps.logger);
  const th = detail.content.find((c) => c.lang === "th");
  const content = th ?? detail.content[0];
  return json(200, {
    id: detail.listing.id,
    dealType: detail.listing.dealType,
    propertyType: detail.listing.propertyType,
    priceThb: detail.listing.priceThb,
    monthlyRent: detail.monthlyRent,
    saleStage: detail.listing.saleStage,
    rentalStatus: detail.listing.rentalStatus,
    province: detail.listing.province,
    amphoe: detail.listing.amphoe,
    tambon: detail.listing.tambon,
    landmark: detail.listing.landmark,
    projectName: detail.listing.projectName,
    bedrooms: detail.listing.bedrooms,
    bathrooms: detail.listing.bathrooms,
    lat: detail.lat,
    lon: detail.lon,
    headline: content?.headline ?? "",
    description: content?.description ?? "",
    sourceGroupId: detail.listing.sourceGroupId,
    claimedByUserId: detail.listing.claimedByUserId,
    isClaimedByMe: detail.listing.claimedByUserId === userId,
    isSaved: detail.isSaved,
    photos,
  });
}

async function handleClaim(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  // AUTHZ GATE (security): only a member of the listing's source group may claim it — otherwise any
  // authed user who learns a listing UUID (e.g. by viewing the detail as a group member) could claim
  // someone else's property and inherit the claimant-gated publish/keep-private/edit rights. A
  // non-member (or a listing with NO source group — it can't be group-claimed in Stage 5) → 404, the
  // same response as a missing listing so existence isn't revealed. The optimistic lock below still
  // resolves WITHIN-group races. (Build C must ensure source-group memberships are populated by the
  // live ingest path before this endpoint is reachable in prod — see the build report.)
  const detail = await deps.repo.getPortalListingDetail(id, userId);
  if (!detail) return json(404, { error: "not_found" });
  const member = await deps.repo.isGroupMember(detail.listing.sourceGroupId, userId);
  if (!member) return json(404, { error: "not_found" });

  const result = await deps.repo.claimListing(id, userId);
  switch (result) {
    case "claimed":
    case "already_yours":
      return json(200, { status: result });
    case "already_claimed":
      // The loser of a concurrent/late claim gets a clear, distinct status (409 Conflict).
      return json(409, { error: "already_claimed", message: "อสังหาฯ นี้ถูกอ้างสิทธิ์โดยผู้อื่นแล้ว" });
    case "not_found":
      return json(404, { error: "not_found" });
  }
}

async function handlePublish(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  // Only the claimant may publish their own listing.
  const detail = await authorizedListing(deps, id, userId, true);
  if (!detail) return json(404, { error: "not_found" });
  await deps.repo.publishListing(id, userId, PUBLISH_CONSENT_VERSION);
  return json(200, { status: "published" });
}

async function handleKeepPrivate(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, true);
  if (!detail) return json(404, { error: "not_found" });
  await deps.repo.keepListingPrivate(id);
  return json(200, { status: "group_private" });
}

/** Listing columns an owner may edit from the mini-app (NOT edit-by-reply). A conservative allowlist —
 * descriptive/positional fields only; lifecycle status, claim columns, FKs, and computed fields are not
 * editable here. `monthlyRent` is handled separately (it lives on the rental satellite). */
const EDITABLE_STRING_FIELDS = [
  "landmark",
  "projectName",
  "addressDetail",
  "province",
  "amphoe",
  "tambon",
] as const;
const EDITABLE_INT_FIELDS = ["priceThb", "bedrooms", "bathrooms"] as const;

async function handleEdit(
  deps: ApiDeps,
  userId: string,
  id: string,
  rawBody: string,
): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, true);
  if (!detail) return json(404, { error: "not_found" });
  const body = parseJsonBody(rawBody);
  if (body === null) return json(400, { error: "invalid_body" });

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE_STRING_FIELDS) {
    const v = body[field];
    if (typeof v === "string") patch[field] = v.trim();
  }
  for (const field of EDITABLE_INT_FIELDS) {
    const v = body[field];
    if (typeof v === "number" && Number.isFinite(v)) patch[field] = Math.trunc(v);
  }
  if (Object.keys(patch).length > 0) await deps.repo.updateListingFields(id, patch);

  // Rent edit (the satellite) — only applied to a rent listing with a numeric monthlyRent in the body.
  const monthlyRent = body.monthlyRent;
  if (
    detail.listing.dealType === "rent" &&
    typeof monthlyRent === "number" &&
    Number.isFinite(monthlyRent)
  ) {
    await deps.repo.updateRentalMonthlyRent(id, Math.trunc(monthlyRent));
  }
  return json(200, { status: "updated" });
}

async function handleSaved(deps: ApiDeps, userId: string): Promise<HttpResponse> {
  const cards = await deps.repo.listSavedListingsForUser(userId);
  const dtos = await Promise.all(
    cards.map(async (c) => {
      const heroUrl = c.heroThumbKey
        ? ((await presignOne(deps.presign, c.heroThumbKey, deps.logger)) ?? undefined)
        : undefined;
      // Saved cards don't surface rent yet (Build D wires saved rendering) — null is correct here.
      return toCardDto(c.listing, heroUrl, null, { savedAt: c.savedAt });
    }),
  );
  return json(200, dtos);
}

async function handleSave(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  await deps.repo.saveListing(id, userId);
  return json(200, { status: "saved" });
}

async function handleUnsave(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  await deps.repo.unsaveListing(id, userId);
  return json(200, { status: "unsaved" });
}

async function handleViewingsList(deps: ApiDeps, userId: string): Promise<HttpResponse> {
  const { upcoming, past } = await deps.repo.listViewingsForUser(userId, deps.now());
  const toDto = async (c: {
    viewing: { id: string; scheduledAt: Date; status: string };
    listing: PortalListingDetail["listing"];
    heroThumbKey: string | null;
  }) => {
    const heroUrl = c.heroThumbKey
      ? ((await presignOne(deps.presign, c.heroThumbKey, deps.logger)) ?? undefined)
      : undefined;
    return {
      viewingId: c.viewing.id,
      scheduledAt: c.viewing.scheduledAt,
      status: c.viewing.status,
      listing: toCardDto(c.listing, heroUrl, null, {}),
    };
  };
  return json(200, {
    upcoming: await Promise.all(upcoming.map(toDto)),
    past: await Promise.all(past.map(toDto)),
  });
}

async function handleCreateViewing(
  deps: ApiDeps,
  userId: string,
  id: string,
  rawBody: string,
): Promise<HttpResponse> {
  // Membership-gated like detail (so ids stay non-enumerable).
  const detail = await authorizedListing(deps, id, userId, false);
  if (!detail) return json(404, { error: "not_found" });
  const body = parseJsonBody(rawBody);
  const raw = typeof body?.scheduledAt === "string" ? body.scheduledAt : "";
  const scheduledAt = new Date(raw);
  if (raw === "" || Number.isNaN(scheduledAt.getTime())) {
    return json(400, { error: "invalid_time" });
  }
  const viewing = await deps.repo.createViewing(id, userId, scheduledAt);
  return json(201, {
    viewingId: viewing.id,
    scheduledAt: viewing.scheduledAt,
    status: viewing.status,
  });
}

async function handleNotesList(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  // Notes are per-user; a member/claimant may keep notes on a listing they can see.
  const detail = await authorizedListing(deps, id, userId, false);
  if (!detail) return json(404, { error: "not_found" });
  const notes = await deps.repo.listNotesForUserListing(id, userId);
  return json(
    200,
    notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt })),
  );
}

async function handleAddNote(
  deps: ApiDeps,
  userId: string,
  id: string,
  rawBody: string,
): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, false);
  if (!detail) return json(404, { error: "not_found" });
  const body = parseJsonBody(rawBody);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (text === "") return json(400, { error: "empty_note" });
  const note = await deps.repo.addListingNote(id, userId, text);
  return json(201, { id: note.id, body: note.body, createdAt: note.createdAt });
}

// --- routing ----------------------------------------------------------------

/** Decode a single path segment, falling back to the raw segment if it isn't valid %-encoding. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Match `/properties/{id}{suffix}` and return the decoded id, or null for any other path. */
function propertyId(path: string, suffix: string): string | null {
  const match = new RegExp(`^/properties/([^/]+)${suffix}$`).exec(path);
  return match?.[1] === undefined ? null : decodeSegment(match[1]);
}

// `/properties/{id}…` routes as a `[method, suffix] → handler(deps, userId, id, rawBody)` table,
// matched first-to-last (the bare-`{id}` GET/PATCH are last so they don't shadow the sub-paths). Each
// handler ignores `rawBody` if it doesn't read a body — uniform signature keeps the table flat.
type PropertyRoute = (
  deps: ApiDeps,
  userId: string,
  id: string,
  rawBody: string,
) => Promise<HttpResponse>;

const PROPERTY_ROUTES: ReadonlyArray<[string, string, PropertyRoute]> = [
  ["POST", "/claim", handleClaim],
  ["POST", "/publish", handlePublish],
  ["POST", "/keep-private", handleKeepPrivate],
  ["POST", "/save", handleSave],
  ["DELETE", "/save", handleUnsave],
  ["GET", "/notes", handleNotesList],
  ["POST", "/notes", handleAddNote],
  ["POST", "/viewings", handleCreateViewing],
  ["PATCH", "", handleEdit],
  ["GET", "", handleDetail],
];

/** Route a verified request (the user is already resolved). Returns 404 for any unmatched route. */
async function route(deps: ApiDeps, request: HttpRequest, userId: string): Promise<HttpResponse> {
  const { method } = request;
  const path = (request.path ?? "/").replace(/\/+$/, "") || "/";

  if (method === "GET" && path === "/me/listings") return handleMyListings(deps, userId);
  if (method === "GET" && path === "/me/saved") return handleSaved(deps, userId);
  if (method === "GET" && path === "/me/viewings") return handleViewingsList(deps, userId);

  for (const [routeMethod, suffix, handle] of PROPERTY_ROUTES) {
    if (method !== routeMethod) continue;
    const id = propertyId(path, suffix);
    if (id !== null) return handle(deps, userId, id, request.rawBody);
  }

  return json(404, { error: "not_found" });
}

/** The package entry point: verify the bearer id-token, resolve the user, route. Any thrown error →
 * 500 with no internal leak (logged for diagnosis). */
export async function handleApi(deps: ApiDeps, request: HttpRequest): Promise<HttpResponse> {
  const method = request.method;
  const path = request.path;
  try {
    const token = bearerToken(request);
    const verified = await deps.verifier.verifyIdToken(token);
    if (verified === null) return json(401, { error: "unauthorized" });
    const userId = await resolveUser(deps.repo, verified.userId);
    return await route(deps, request, userId);
  } catch (error) {
    deps.logger.error("api request failed", {
      error: error instanceof Error ? error.message : String(error),
      path,
      method,
    });
    return json(500, { error: "internal_error" });
  }
}
