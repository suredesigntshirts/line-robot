import type {
  ClaimResult,
  InterestFlagWithUser,
  ListingNoteRow,
  ModerationResolveResult,
  MyListingCard,
  PendingModerationRow,
  PortalListingDetail,
  QuoteRow,
  RoleApplication,
  RoleApplicationResult,
  RoleApprovalResult,
  RoleRow,
  SavedListingCard,
  UserRow,
  ViewingCard,
  ViewingRow,
} from "@line-robot/db";
import type { Urgency } from "@line-robot/domain";
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

  // --- Stage 6 (groups & dealflow) -----------------------------------------
  // The server-side role gate's source of truth: a caller's roles + their kind/approvalStatus.
  // requireRole/requireVetted read THIS — the client never asserts its own role.
  getUserRoles(userId: string): Promise<RoleRow[]>;
  // Interest flags (D-S6-3): a member raises one; the claimant/admin lists them.
  createInterestFlag(listingId: string, userId: string): Promise<void>;
  listInterestFlags(listingId: string): Promise<InterestFlagWithUser[]>;
  // Role application + vetting (D9, D-S6-8). `applyForRole` is ATOMIC (one txn: re-application guard +
  // pending role + preferences) so a partial failure can't leave a pending role with no prefs. An
  // admin lists the pending queue and approves/rejects (stamping their own id), terminal-state guarded.
  applyForRole(
    userId: string,
    kind: "broker" | "investor",
    prefs: { provinces: string[]; propertyTypes: string[]; priceBandIds: string[] },
  ): Promise<RoleApplicationResult>;
  getLatestRoleApplication(userId: string): Promise<RoleRow | undefined>;
  listRoleApplications(status: "pending"): Promise<RoleApplication[]>;
  setRoleApproval(
    roleId: string,
    status: "approved" | "rejected",
    reviewedBy: string,
  ): Promise<RoleApprovalResult>;
  // Moderation queue (D-S6-7): list the pending gate-fail set; resolve one approve/reject (terminal
  // -state guarded). The typed result lets the `if (outcome)` 404/409 contract compile-check (fix H).
  listPendingModeration(): Promise<PendingModerationRow[]>;
  resolveModerationItem(
    id: string,
    status: "approved" | "rejected",
  ): Promise<ModerationResolveResult>;
  // Quick-sale flag (D10): the claimant marks a listing quick-sale.
  setListingUrgency(id: string, urgency: Urgency): Promise<void>;
  // Quotes (D10): a vetted broker/investor submits one; the claimant/admin lists them.
  createQuote(input: {
    listingId: string;
    brokerUserId: string;
    amountThb: number;
    discountVsMarket?: number;
    termsNote?: string;
  }): Promise<QuoteRow>;
  listQuotesForListing(listingId: string): Promise<QuoteRow[]>;
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

/** A group-less (1:1-DM-sourced) listing is claimable/readable by the real DM poster recorded at
 * ingest (plan 23 Group D). `dm_claimant_user_id` holds the bare-id LIFF identity, the SAME `userId`
 * the group-member check compares — so this only ever WIDENS admission to the legitimate poster, and
 * is never true for a group-sourced listing (`sourceGroupId` non-null). Shared by both gate sites
 * (`authorizedListing` + `handleClaim`) so they can't drift. */
function isDmClaimant(listing: PortalListingDetail["listing"], userId: string): boolean {
  // Self-guarding: require a concrete caller id AND a concrete stored claimant before matching, so a
  // runtime-undefined column or an empty caller id can never make `x === x` admit. Unreachable today
  // (resolveUser returns a real uuid; the column is uuid-or-NULL) — defense-in-depth for a security gate.
  return (
    userId !== "" &&
    listing.sourceGroupId === null &&
    typeof listing.dmClaimantUserId === "string" &&
    listing.dmClaimantUserId === userId
  );
}

/** A caller may read/act on a listing iff they CLAIMED it, are a member of its source group, OR are
 * the DM poster of a group-less listing. Returns the detail when authorized, or null (the handler maps
 * null to 404 — same for unauthorized + missing, so ids stay non-enumerable). `requireClaimant`
 * tightens it to owner-only (edit/publish): a DM poster must actually CLAIM before they can edit. */
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
  if (member) return detail;
  return isDmClaimant(detail.listing, userId) ? detail : null;
}

// --- Stage-6 server-side role gates (D-S6-5/6 — NEVER UI-gated) --------------
//
// The client sends only a verified id-token; `resolveUser` turned that into the trusted Postgres
// userId BEFORE these run. The role is read SERVER-SIDE from `role` rows — the client can never
// assert its own role. This is the spec-auditor invariant: admin/quick-quote paths cannot be driven
// by a non-admin / unvetted caller even with a hand-crafted request.

/** Admit only a caller holding an APPROVED role of `kind` (D-S6-5: 'admin' is the /admin/* gate).
 * Reads the persisted role rows — the single role predicate (no passthrough wrapper). */
async function requireRole(deps: ApiDeps, userId: string, kind: RoleRow["kind"]): Promise<boolean> {
  const roles = await deps.repo.getUserRoles(userId);
  return roles.some((r) => r.kind === kind && r.approvalStatus === "approved");
}

/** Admit only an approved broker OR investor (D-S6-6). The gate for the quote-submit endpoint — the
 * spec-auditor invariant: a quote can NEVER be authored by an unvetted user. The one other predicate
 * (two role checks total — admit-by-kind vs admit-by-either-vetted-kind). */
async function requireVetted(deps: ApiDeps, userId: string): Promise<boolean> {
  const roles = await deps.repo.getUserRoles(userId);
  return roles.some(
    (r) => (r.kind === "broker" || r.kind === "investor") && r.approvalStatus === "approved",
  );
}

/** The claimant-or-admin read gate (D-S6-3 interest flags + D10 quotes): a non-existent listing or a
 * caller who is neither the claimant nor an admin gets null → the handler maps it to 404 (so ids stay
 * non-enumerable and a plain group member can't see who else is interested / what's been offered).
 * Extracted because this exact gate is a security invariant shared by two read handlers — it must not
 * drift between them. */
async function claimantOrAdmin(
  deps: ApiDeps,
  id: string,
  userId: string,
): Promise<PortalListingDetail | null> {
  const detail = await deps.repo.getPortalListingDetail(id, userId);
  if (!detail) return null;
  if (detail.listing.claimedByUserId === userId) return detail;
  return (await requireRole(deps, userId, "admin")) ? detail : null;
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
  // AUTHZ GATE (security): a caller may claim only if they are a member of the listing's source group,
  // OR are the recorded DM poster of a group-less listing (plan 23 Group D). Otherwise any authed user
  // who learns a listing UUID (e.g. by viewing the detail as a group member) could claim someone else's
  // property and inherit the claimant-gated publish/keep-private/edit rights. Anyone else → 404, the
  // same response as a missing listing so existence isn't revealed. The optimistic lock below still
  // resolves races. (Build C / Group D ensure the live ingest path populates source-group memberships
  // OR `dm_claimant_user_id` before this endpoint is reachable in prod.)
  const detail = await deps.repo.getPortalListingDetail(id, userId);
  if (!detail) return json(404, { error: "not_found" });
  const member = await deps.repo.isGroupMember(detail.listing.sourceGroupId, userId);
  if (!member && !isDmClaimant(detail.listing, userId)) return json(404, { error: "not_found" });

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
    // Non-negativity is enforced here (not just client-side) so a direct API call can't persist a
    // negative price/beds/baths. Skip a non-conforming value rather than 400 (matches the allowlist style).
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) patch[field] = Math.trunc(v);
  }
  if (Object.keys(patch).length > 0) await deps.repo.updateListingFields(id, patch);

  // Rent edit (the satellite) — only applied to a rent listing with a numeric monthlyRent in the body.
  const monthlyRent = body.monthlyRent;
  if (
    detail.listing.dealType === "rent" &&
    typeof monthlyRent === "number" &&
    Number.isFinite(monthlyRent) &&
    monthlyRent >= 0
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
  // Reject unparseable AND past times server-side (the client guards too, but a direct call must not
  // create a past-dated viewing that lands silently in the "past" section).
  if (
    raw === "" ||
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getTime() <= deps.now().getTime()
  ) {
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

// --- Stage 6: interest flags ------------------------------------------------

/** A group member flags interest on a listing (D-S6-3). Membership-gated like notes/viewings (a flag
 * is a member signal, not a claim) so ids stay non-enumerable. Idempotent (one flag per member). */
async function handleFlagInterest(
  deps: ApiDeps,
  userId: string,
  id: string,
): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, false);
  if (!detail) return json(404, { error: "not_found" });
  await deps.repo.createInterestFlag(id, userId);
  return json(201, { status: "flagged" });
}

/** List a listing's interest flags — visible to the CLAIMANT or an admin only (D-S6-3). A plain group
 * member who isn't the claimant cannot see who else is interested. */
async function handleListInterest(
  deps: ApiDeps,
  userId: string,
  id: string,
): Promise<HttpResponse> {
  const detail = await claimantOrAdmin(deps, id, userId);
  if (!detail) return json(404, { error: "not_found" });
  const flags = await deps.repo.listInterestFlags(id);
  return json(
    200,
    flags.map((f) => ({ userId: f.userId, displayName: f.displayName, createdAt: f.createdAt })),
  );
}

// --- Stage 6: role application (broker/investor vetting request) -------------

/** Read a string[] body field, keeping only string entries (drops a non-array / non-string item). */
function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** A user applies for a broker/investor role (D9, D-S6-6). Atomically creates a PENDING role and
 * stores the quick-quote matching preferences captured in the same form (one transaction — fix E).
 * Self-service — any authed user may apply; the admin gate is on the approval step, not here.
 * Re-application guard (fix D): if the user already has a live (pending/approved) role of that kind,
 * no duplicate row is created — the existing status is returned (200), not a second pending row. */
async function handleRoleApplication(
  deps: ApiDeps,
  userId: string,
  rawBody: string,
): Promise<HttpResponse> {
  const body = parseJsonBody(rawBody);
  if (body === null) return json(400, { error: "invalid_body" });
  const kind = body.kind;
  if (kind !== "broker" && kind !== "investor") return json(400, { error: "invalid_kind" });

  const result = await deps.repo.applyForRole(userId, kind, {
    provinces: stringArray(body.provinces),
    propertyTypes: stringArray(body.propertyTypes),
    priceBandIds: stringArray(body.priceBandIds),
  });
  // A fresh application → 201; an existing live role short-circuited the insert → 200 with its status.
  return json(result.created ? 201 : 200, { status: result.status });
}

/** The caller's current broker/investor application + status (D-S6-6, optional read). */
async function handleMyRoleApplication(deps: ApiDeps, userId: string): Promise<HttpResponse> {
  const role = await deps.repo.getLatestRoleApplication(userId);
  if (!role) return json(200, { kind: null, status: "none" });
  return json(200, { kind: role.kind, status: role.approvalStatus });
}

// --- Stage 6: admin vetting (admin-gated) -----------------------------------

async function handleAdminRoleApplications(
  deps: ApiDeps,
  adminUserId: string,
): Promise<HttpResponse> {
  if (!(await requireRole(deps, adminUserId, "admin"))) return json(404, { error: "not_found" });
  const apps = await deps.repo.listRoleApplications("pending");
  return json(
    200,
    apps.map((a) => ({
      roleId: a.roleId,
      userId: a.userId,
      displayName: a.displayName,
      kind: a.kind,
    })),
  );
}

async function handleAdminVetRole(
  deps: ApiDeps,
  adminUserId: string,
  roleId: string,
  rawBody: string,
): Promise<HttpResponse> {
  if (!(await requireRole(deps, adminUserId, "admin"))) return json(404, { error: "not_found" });
  const body = parseJsonBody(rawBody);
  const decision = body?.decision;
  if (decision !== "approved" && decision !== "rejected")
    return json(400, { error: "invalid_body" });
  const result = await deps.repo.setRoleApproval(roleId, decision, adminUserId);
  // Terminal-state guard (fix B): a stale/double admin request that finds the role already decided →
  // 409 (the prior decision STANDS — it is never silently flipped), reporting the current status.
  if (result.outcome === "not_found") return json(404, { error: "not_found" });
  if (result.outcome === "already_decided") {
    return json(409, { error: "already_decided", status: result.row.approvalStatus });
  }
  return json(200, { status: decision });
}

// --- Stage 6: admin moderation queue (admin-gated) --------------------------

async function handleAdminModeration(deps: ApiDeps, adminUserId: string): Promise<HttpResponse> {
  if (!(await requireRole(deps, adminUserId, "admin"))) return json(404, { error: "not_found" });
  const items = await deps.repo.listPendingModeration();
  return json(
    200,
    items.map((m) => ({
      id: m.id,
      listingId: m.targetId,
      headline: m.headline,
      reason: m.reason,
      createdAt: m.createdAt,
    })),
  );
}

async function handleAdminResolveModeration(
  deps: ApiDeps,
  adminUserId: string,
  itemId: string,
  rawBody: string,
): Promise<HttpResponse> {
  if (!(await requireRole(deps, adminUserId, "admin"))) return json(404, { error: "not_found" });
  const body = parseJsonBody(rawBody);
  const decision = body?.decision;
  if (decision !== "approved" && decision !== "rejected")
    return json(400, { error: "invalid_body" });
  // v1 (fix I): this is admin REVIEW — it records the decision on the moderation_item. It does NOT
  // itself make a listing publicly visible: nothing in the claim/publish/public-query path reads
  // moderation_item.status yet (that listing-lifecycle wiring is cross-cutting and QUEUED). Public
  // visibility still requires the poster's own publish-consent grant (LEGAL-02) regardless.
  const result = await deps.repo.resolveModerationItem(itemId, decision);
  // Terminal-state guard (fix B): an already-decided item is not re-flipped → 409.
  if (result.outcome === "not_found") return json(404, { error: "not_found" });
  if (result.outcome === "already_decided") {
    return json(409, { error: "already_decided", status: result.row.status });
  }
  return json(200, { status: decision });
}

// --- Stage 6: quick-sale flag (claimant-only) -------------------------------

async function handleQuickSale(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  const detail = await authorizedListing(deps, id, userId, true);
  if (!detail) return json(404, { error: "not_found" });
  // Quick-sale is SALE-oriented (fix F): it feeds the broker quote flow, which prices a purchase. A
  // rental must not enter it — reject a non-sale listing rather than flag it.
  if (detail.listing.dealType !== "sale") {
    return json(409, { error: "not_a_sale_listing" });
  }
  await deps.repo.setListingUrgency(id, "quick_sale");
  // The matched Flex PUSH to vetted users is INC-B4's bot sweep — this only persists the flag.
  return json(200, { status: "quick_sale" });
}

// --- Stage 6: quotes (vetted-gated submit; claimant/admin read) -------------

/** A sane upper bound on a quote amount (10 billion THB). A quote that high is garbage/overflow, not a
 * real offer — and this column feeds the Stage-7 AVM, so we reject rather than ingest noise (fix G). */
const MAX_QUOTE_THB = 10_000_000_000;

/** A vetted broker/investor submits a structured quote (D10). VETTED-GATED — the spec-auditor
 * invariant: a quote can never be authored by an unvetted user. The listing must EXIST and be flagged
 * `quick_sale` (fix A): a quote targets a quick-sale listing the broker was pushed, and a bad id must
 * 404 here rather than hit the `quote.listing_id` FK and 500. (Per-recipient push-invitation tracking
 * — proving THIS broker was actually pushed THIS listing — is deferred/queued; quick_sale + existence
 * is the v1 narrowing over the prior vetted-only gate.) */
async function handleSubmitQuote(
  deps: ApiDeps,
  userId: string,
  id: string,
  rawBody: string,
): Promise<HttpResponse> {
  if (!(await requireVetted(deps, userId))) return json(403, { error: "not_vetted" });
  // The listing must exist (→ 404, never a 500 on the FK) and be a live quick-sale target.
  const detail = await deps.repo.getPortalListingDetail(id, userId);
  if (!detail) return json(404, { error: "not_found" });
  if (detail.listing.urgency !== "quick_sale") {
    return json(409, { error: "not_quick_sale" });
  }

  const body = parseJsonBody(rawBody);
  if (body === null) return json(400, { error: "invalid_body" });
  // amountThb: a positive, finite number within a sane cap (feeds the AVM — no garbage).
  const amountThb = body.amountThb;
  if (
    typeof amountThb !== "number" ||
    !Number.isFinite(amountThb) ||
    amountThb <= 0 ||
    amountThb > MAX_QUOTE_THB
  ) {
    return json(400, { error: "invalid_amount" });
  }
  // discountVsMarket (optional): if given, a finite percentage in [0, 100].
  let discountVsMarket: number | undefined;
  if (body.discountVsMarket !== undefined) {
    const d = body.discountVsMarket;
    if (typeof d !== "number" || !Number.isFinite(d) || d < 0 || d > 100) {
      return json(400, { error: "invalid_discount" });
    }
    discountVsMarket = d;
  }
  const termsNote = typeof body.termsNote === "string" ? body.termsNote.trim() : undefined;
  const quote = await deps.repo.createQuote({
    listingId: id,
    brokerUserId: userId,
    amountThb: Math.trunc(amountThb),
    discountVsMarket,
    termsNote: termsNote === "" ? undefined : termsNote,
  });
  return json(201, { quoteId: quote.id });
}

/** List a listing's quotes — visible to the CLAIMANT or an admin only (the poster reviews offers). */
async function handleListQuotes(deps: ApiDeps, userId: string, id: string): Promise<HttpResponse> {
  const detail = await claimantOrAdmin(deps, id, userId);
  if (!detail) return json(404, { error: "not_found" });
  const quotes = await deps.repo.listQuotesForListing(id);
  return json(
    200,
    quotes.map((q) => ({
      quoteId: q.id,
      brokerUserId: q.brokerUserId,
      amountThb: q.amountThb,
      discountVsMarket: q.discountVsMarket,
      termsNote: q.termsNote,
      status: q.status,
      createdAt: q.createdAt,
    })),
  );
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
  // Stage 6 (groups & dealflow)
  ["POST", "/interest", handleFlagInterest],
  ["GET", "/interest", handleListInterest],
  ["POST", "/quick-sale", handleQuickSale],
  ["POST", "/quotes", handleSubmitQuote],
  ["GET", "/quotes", handleListQuotes],
  ["PATCH", "", handleEdit],
  ["GET", "", handleDetail],
];

// `/admin/{collection}/{id}` resolve-routes as a `[method, collection] → handler` table — the admin
// vetting/moderation decisions. The id is the second path segment. All are admin-gated INSIDE the
// handler (D-S6-5) — the route table only dispatches; it never implies authorization.
type AdminItemRoute = (
  deps: ApiDeps,
  adminUserId: string,
  id: string,
  rawBody: string,
) => Promise<HttpResponse>;

const ADMIN_ITEM_ROUTES: ReadonlyArray<[string, string, AdminItemRoute]> = [
  ["POST", "role-applications", handleAdminVetRole],
  ["POST", "moderation", handleAdminResolveModeration],
];

/** Match `/admin/{collection}/{id}` and return the decoded `{id}` (or null). */
function adminItemId(path: string, collection: string): string | null {
  const match = new RegExp(`^/admin/${collection}/([^/]+)$`).exec(path);
  return match?.[1] === undefined ? null : decodeSegment(match[1]);
}

/** Route a verified request (the user is already resolved). Returns 404 for any unmatched route. */
async function route(deps: ApiDeps, request: HttpRequest, userId: string): Promise<HttpResponse> {
  const { method } = request;
  const path = (request.path ?? "/").replace(/\/+$/, "") || "/";

  if (method === "GET" && path === "/me/listings") return handleMyListings(deps, userId);
  if (method === "GET" && path === "/me/saved") return handleSaved(deps, userId);
  if (method === "GET" && path === "/me/viewings") return handleViewingsList(deps, userId);
  // Stage 6: role application (self-service create + the caller's own status).
  if (method === "POST" && path === "/me/role-application")
    return handleRoleApplication(deps, userId, request.rawBody);
  if (method === "GET" && path === "/me/role-application")
    return handleMyRoleApplication(deps, userId);
  // Stage 6: admin queues (admin-gated inside each handler).
  if (method === "GET" && path === "/admin/role-applications")
    return handleAdminRoleApplications(deps, userId);
  if (method === "GET" && path === "/admin/moderation") return handleAdminModeration(deps, userId);

  for (const [routeMethod, collection, handle] of ADMIN_ITEM_ROUTES) {
    if (method !== routeMethod) continue;
    const id = adminItemId(path, collection);
    if (id !== null) return handle(deps, userId, id, request.rawBody);
  }

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
