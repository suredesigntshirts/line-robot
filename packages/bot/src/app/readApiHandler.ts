/**
 * The mini-app's read-only HTTP handler, independent of the Lambda Function URL plumbing. It turns a
 * LIFF id-token (the `Authorization: Bearer …` header) into the caller's LINE user id, then serves
 * three read routes over the SAME catalog the chat bot uses — no writes, no LLM. Provider-agnostic
 * and dependency-injected so it's fully unit-testable with fakes (no AWS, no network).
 *
 * Security posture mirrors the ingest Lambda's: the Function URL is public, and every route is gated
 * by the in-handler id-token verification (`aud` must equal our MINI App channel). `/properties/{id}`
 * additionally enforces membership — a caller can only fetch a listing reachable through one of their
 * conversations — so property ids are not enumerable.
 */
import type { UpcomingItem } from "@line-robot/shared";
import type { Property, PropertyPhoto } from "../core/domain/catalog.js";
import { type PhotoDto, toDetailDto, toListDto } from "../core/handlers/catalogDto.js";
import { propertyTitle } from "../core/handlers/views.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
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

/** Gallery order: property photos first, then chanote scans, then other documents (matches the chat
 * gallery in {@link ../core/handlers/catalogAssistant}). */
const PHOTO_KIND_ORDER: Record<string, number> = { property: 0, chanote: 1, other: 2 };

function orderedPhotos(photos: readonly PropertyPhoto[] | undefined): readonly PropertyPhoto[] {
  if (photos === undefined) {
    return [];
  }
  return [...photos].sort(
    (a, b) => (PHOTO_KIND_ORDER[a.kind] ?? 9) - (PHOTO_KIND_ORDER[b.kind] ?? 9),
  );
}

/** Hero key: first `property` photo, falling back to any image. */
function heroPhotoKey(photos: readonly PropertyPhoto[] | undefined): string | undefined {
  if (photos === undefined || photos.length === 0) {
    return undefined;
  }
  return (photos.find((p) => p.kind === "property") ?? photos[0])?.s3Key;
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
  catalog: CatalogRepository,
  userId: string,
): Promise<Set<string>> {
  const convKeys = await catalog.listUserConversations(userId);
  const idLists = await Promise.all(convKeys.map((key) => catalog.listConversationProperties(key)));
  return new Set(idLists.flat());
}

async function handleMyProperties(deps: ReadApiDeps, userId: string): Promise<HttpResponse> {
  const properties = (await deps.catalog.listPropertiesForUser(userId)).sort(
    (a, b) => (b.lastActivityAt ?? b.updatedAt ?? 0) - (a.lastActivityAt ?? a.updatedAt ?? 0),
  );
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
  const properties = await deps.catalog.listPropertiesForUser(userId);
  const rows: UpcomingItem[] = [];
  await Promise.all(
    properties.map(async (property) => {
      const events = await deps.catalog.listPropertyEvents(property.propertyId);
      for (const event of events) {
        if (event.notifiedAt === undefined) {
          rows.push({
            propertyId: property.propertyId,
            propertyTitle: propertyTitle(property),
            dueAt: event.dueAt,
            ...(event.title !== undefined ? { title: event.title } : {}),
          });
        }
      }
    }),
  );
  rows.sort((a, b) => a.dueAt - b.dueAt);
  return json(200, rows);
}

/** Match `/properties/{id}` and return the (decoded) id, or null for any other path. */
function propertyDetailId(path: string): string | null {
  const match = /^\/properties\/([^/]+)$/.exec(path);
  if (match?.[1] === undefined) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
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
