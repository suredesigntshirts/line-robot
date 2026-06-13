/**
 * The mini-app's HTTP handler, independent of the Lambda Function URL plumbing. It turns a LIFF
 * id-token (the `Authorization: Bearer …` header) into the caller's LINE user id, then serves the
 * read routes plus ONE narrow write — "book a viewing" — over the SAME catalog the chat bot uses (no
 * LLM). Provider-agnostic and dependency-injected so it's fully unit-testable with fakes (no AWS, no
 * network).
 *
 * Security posture mirrors the ingest Lambda's: the Function URL is public, and every route is gated
 * by the in-handler id-token verification (`aud` must equal our MINI App channel). The `/properties/{id}`
 * routes additionally enforce membership — a caller can only touch a listing reachable through one of
 * their conversations — so property ids are not enumerable. The only write (`POST
 * /properties/{id}/viewings`) is membership-gated too and creates a follow-up event for the caller
 * alone (its reminder goes to the caller's own 1:1 chat); it cannot edit or delete anything.
 */
import { randomUUID } from "node:crypto";
import type { BookViewingResponse } from "@line-robot/shared";
import { byActivityDesc, type Property } from "../core/domain/catalog.js";
import { conversationKey } from "../core/domain/conversation.js";
import { resolveFollowUpTime } from "../core/domain/followup.js";
import { heroPhotoKey, orderedPhotos } from "../core/domain/photos.js";
import { type PhotoDto, toDetailDto, toListDto } from "../core/handlers/catalogDto.js";
import { collectUpcoming } from "../core/handlers/upcoming.js";
import type { CatalogRepository, ConversationStore, PropertyStore } from "../core/ports/catalog.js";
import type { HttpRequest, HttpResponse } from "../core/ports/httpGateway.js";
import type { LineTokenVerifier } from "../core/ports/lineTokenVerifier.js";
import type { MediaUrlSigner } from "../core/ports/mediaUrlSigner.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

export interface ReadApiDeps {
  readonly catalog: CatalogRepository;
  readonly signer: MediaUrlSigner;
  readonly verifier: LineTokenVerifier;
  readonly logger: Logger;
  readonly clock: Clock;
}

// NOTE: CORS headers are owned ENTIRELY by the Lambda Function URL's `cors` config (infra), which
// answers the OPTIONS preflight without invoking us and adds the (origin-locked) ACAO to every
// response. The handler must NOT also set `access-control-allow-origin` — two ACAO headers on one
// response is invalid CORS and the browser rejects it (the SPA's fetch then throws).
function json(statusCode: number, body: unknown): HttpResponse {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

/** The Bearer token from the (case-insensitive) Authorization header, or "" when absent/malformed. */
function bearerToken(request: HttpRequest): string {
  const headers = request.headers;
  const raw = headers.authorization ?? headers.Authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match?.[1]?.trim() ?? "";
}

/** Presign one key, swallowing failure (mirrors the chat assistant — a bad/expired key never 500s
 * the whole listing; it's simply dropped). */
async function presign(
  signer: MediaUrlSigner,
  key: string,
  logger: Logger,
): Promise<string | null> {
  try {
    return await signer.presignGet(key);
  } catch (error) {
    logger.warn("read-api: presign failed; dropping photo", {
      s3Key: key,
      error: String(error),
    });
    return null;
  }
}

async function presignHero(
  signer: MediaUrlSigner,
  property: Property,
  logger: Logger,
): Promise<string | undefined> {
  const key = heroPhotoKey(property.photos);
  if (key === undefined) {
    return undefined;
  }
  return (await presign(signer, key, logger)) ?? undefined;
}

async function presignGallery(
  signer: MediaUrlSigner,
  property: Property,
  logger: Logger,
): Promise<PhotoDto[]> {
  const photos = orderedPhotos(property.photos);
  const urls = await Promise.all(photos.map((p) => presign(signer, p.s3Key, logger)));
  const out: PhotoDto[] = [];
  photos.forEach((photo, i) => {
    const url = urls[i];
    if (url !== null && url !== undefined) {
      out.push({
        url,
        kind: photo.kind,
        ...(photo.label !== undefined ? { label: photo.label } : {}),
      });
    }
  });
  return out;
}

/** The id set the caller may read: every property reachable through one of their conversations. */
async function allowedPropertyIds(
  catalog: ConversationStore & PropertyStore,
  userId: string,
): Promise<Set<string>> {
  const convKeys = await catalog.listUserConversations(userId);
  const idLists = await Promise.all(convKeys.map((key) => catalog.listConversationProperties(key)));
  return new Set(idLists.flat());
}

async function handleMyProperties(deps: ReadApiDeps, userId: string): Promise<HttpResponse> {
  const properties = (await deps.catalog.listPropertiesForUser(userId)).sort(byActivityDesc);
  const dtos = await Promise.all(
    properties.map(async (p) => {
      const heroUrl = await presignHero(deps.signer, p, deps.logger);
      return { ...toListDto(p), ...(heroUrl !== undefined ? { heroUrl } : {}) };
    }),
  );
  return json(200, dtos);
}

async function handlePropertyDetail(
  deps: ReadApiDeps,
  userId: string,
  propertyId: string,
): Promise<HttpResponse> {
  // Membership gate FIRST — never reveal whether an unowned id exists (same 404 either way).
  const allowed = await allowedPropertyIds(deps.catalog, userId);
  if (!allowed.has(propertyId)) {
    return json(404, { error: "not_found" });
  }
  const property = await deps.catalog.getProperty(propertyId);
  if (property === null) {
    return json(404, { error: "not_found" });
  }
  const photos = await presignGallery(deps.signer, property, deps.logger);
  return json(200, { ...toDetailDto(property), photos });
}

async function handleUpcoming(deps: ReadApiDeps, userId: string): Promise<HttpResponse> {
  return json(200, await collectUpcoming(deps.catalog, userId));
}

/** Parse a JSON request body into a plain object, or null when absent/not-an-object/malformed. */
function parseJsonBody(rawBody: string): Record<string, unknown> | null {
  if (rawBody === "") {
    return null;
  }
  try {
    const value: unknown = JSON.parse(rawBody);
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Book a viewing: create a follow-up {@link PropertyEvent} on a property the caller can reach, due at
 * a Bangkok-local time. Membership-gated like the detail read (same 404 for an unreachable id, so ids
 * stay non-enumerable). The reminder is targeted at the caller's OWN 1:1 chat (`user#<userId>`), so
 * the existing reminder sweep pushes it with no change. The same {@link resolveFollowUpTime} rule the
 * chat datetime-picker uses validates the time, so the two paths can't drift.
 */
async function handleBookViewing(
  deps: ReadApiDeps,
  userId: string,
  propertyId: string,
  rawBody: string,
): Promise<HttpResponse> {
  const allowed = await allowedPropertyIds(deps.catalog, userId);
  if (!allowed.has(propertyId)) {
    return json(404, { error: "not_found" });
  }
  const property = await deps.catalog.getProperty(propertyId);
  if (property === null) {
    return json(404, { error: "not_found" });
  }

  const parsed = parseJsonBody(rawBody);
  const datetimeLocal = typeof parsed?.datetimeLocal === "string" ? parsed.datetimeLocal : "";
  const now = deps.clock.now();
  const when = resolveFollowUpTime(datetimeLocal, now);
  if (!when.ok) {
    return json(400, { error: when.reason === "invalid" ? "invalid_time" : "past_time" });
  }

  const rawTitle = typeof parsed?.title === "string" ? parsed.title.trim() : "";
  const eventId = randomUUID();
  await deps.catalog.addEvent({
    eventId,
    propertyId,
    dueAt: when.dueAt,
    title: rawTitle !== "" ? rawTitle : "Viewing",
    // The caller's own 1:1 chat with the OA — derived from the verified id-token, not the request —
    // so a booking can only schedule a reminder to oneself.
    notifyConversationKey: conversationKey({ kind: "user", userId }),
    createdAt: now,
  });
  const response: BookViewingResponse = { eventId, dueAt: when.dueAt };
  return json(201, response);
}

/** Decode a single path segment, falling back to the raw segment if it isn't valid %-encoding. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Match `/properties/{id}` and return the (decoded) id, or null for any other path. */
function propertyDetailId(path: string): string | null {
  const match = /^\/properties\/([^/]+)$/.exec(path);
  return match?.[1] === undefined ? null : decodeSegment(match[1]);
}

/** Match `/properties/{id}/viewings` and return the (decoded) id, or null for any other path. */
function viewingsPropertyId(path: string): string | null {
  const match = /^\/properties\/([^/]+)\/viewings$/.exec(path);
  return match?.[1] === undefined ? null : decodeSegment(match[1]);
}

export async function handleReadApi(
  deps: ReadApiDeps,
  request: HttpRequest,
): Promise<HttpResponse> {
  const method = request.method;
  // The path is after the Function URL host (the SPA hits the URL root); strip any trailing
  // slash so "/me/properties/" and "/me/properties" route the same.
  const path = (request.path ?? "/").replace(/\/+$/, "") || "/";

  // The OPTIONS preflight is answered by the Function URL's CORS config without invoking this
  // handler, so there's no OPTIONS branch here (and we must not emit our own CORS headers — see
  // `json`). If an OPTIONS ever does reach us it simply falls through to the 401 below, harmlessly.

  try {
    const token = bearerToken(request);
    const verified = await deps.verifier.verifyIdToken(token);
    if (verified === null) {
      return json(401, { error: "unauthorized" });
    }
    const userId = verified.userId;

    if (method === "GET" && path === "/me/properties") {
      return await handleMyProperties(deps, userId);
    }
    if (method === "GET" && path === "/me/upcoming") {
      return await handleUpcoming(deps, userId);
    }
    const detailId = propertyDetailId(path);
    if (method === "GET" && detailId !== null) {
      return await handlePropertyDetail(deps, userId, detailId);
    }
    const bookId = viewingsPropertyId(path);
    if (method === "POST" && bookId !== null) {
      return await handleBookViewing(deps, userId, bookId, request.rawBody);
    }
    return json(404, { error: "not_found" });
  } catch (error) {
    // Never leak internals to the webview; log the detail for diagnosis.
    deps.logger.error("read-api request failed", {
      error: error instanceof Error ? error.message : String(error),
      path,
      method,
    });
    return json(500, { error: "internal_error" });
  }
}
