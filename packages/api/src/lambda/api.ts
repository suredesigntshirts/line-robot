import { S3Client } from "@aws-sdk/client-s3";
import {
  addListingNote,
  claimListing,
  createUserWithIdentity,
  createViewing,
  findUserByIdentity,
  getDb,
  getPortalListingDetail,
  isGroupMember,
  keepListingPrivate,
  listMyListings,
  listNotesForUserListing,
  listSavedListingsForUser,
  listViewingsForUser,
  publishListing,
  saveListing,
  unsaveListing,
  updateListingFields,
  updateRentalMonthlyRent,
} from "@line-robot/db";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { LineIdTokenVerifier } from "../adapters/lineIdTokenVerifier.ts";
import { s3Presign } from "../adapters/s3Presigner.ts";
import { loadApiEnv } from "../config.ts";
import { type ApiDeps, handleApi, type Logger, type Repo } from "../handler.ts";
import type { HttpRequest } from "../http.ts";

// Composition root for the mini-app API Lambda (Function URL). Mirrors packages/bot/src/lambda/read-api:
// it builds the deps once per warm container, maps the Function URL event to our provider-agnostic
// HttpRequest (lower-casing headers so the Bearer lookup is case-insensitive; decoding a base64 body),
// and delegates to handleApi. The v1 read-api Lambda is untouched — this runs in parallel.

/** Structured JSON logger to stdout (CloudWatch parses it). A single concrete impl — no port needed. */
const consoleLogger: Logger = {
  warn(message, context) {
    console.warn(JSON.stringify({ level: "WARN", message, ...context }));
  },
  error(message, context) {
    console.error(JSON.stringify({ level: "ERROR", message, ...context }));
  },
};

function buildDeps(): ApiDeps {
  const env = loadApiEnv();
  const s3 = new S3Client({});
  const db = getDb(env.DATABASE_URL);

  // The production {@link Repo}: every member is the matching @line-robot/db public-barrel function
  // with its leading `db` bound. Inlined here (not a separate factory) — it has exactly one
  // implementation; the handler's test fake is the only other shape, so a named factory would be a
  // one-caller abstraction.
  const repo: Repo = {
    findUserByIdentity: (provider, subject) => findUserByIdentity(db, provider, subject),
    createLineUser: (displayName, subject) =>
      createUserWithIdentity(
        db,
        { displayName },
        { provider: "line", providerSubject: subject, verifiedAt: new Date() },
      ),
    getPortalListingDetail: (id) => getPortalListingDetail(db, id),
    isGroupMember: (groupId, userId) => isGroupMember(db, groupId, userId),
    listMyListings: (userId) => listMyListings(db, userId),
    claimListing: (listingId, userId) => claimListing(db, listingId, userId),
    publishListing: (listingId, userId, consentVersion) =>
      publishListing(db, listingId, userId, consentVersion),
    keepListingPrivate: (listingId) => keepListingPrivate(db, listingId),
    updateListingFields: (id, patch) => updateListingFields(db, id, patch),
    updateRentalMonthlyRent: (id, monthlyRent) => updateRentalMonthlyRent(db, id, monthlyRent),
    listSavedListingsForUser: (userId) => listSavedListingsForUser(db, userId),
    saveListing: (listingId, userId) => saveListing(db, listingId, userId),
    unsaveListing: (listingId, userId) => unsaveListing(db, listingId, userId),
    listViewingsForUser: (userId, now) => listViewingsForUser(db, userId, now),
    createViewing: (listingId, userId, scheduledAt) =>
      createViewing(db, listingId, userId, scheduledAt),
    listNotesForUserListing: (listingId, userId) => listNotesForUserListing(db, listingId, userId),
    addListingNote: (listingId, userId, body) => addListingNote(db, listingId, userId, body),
  };

  return {
    repo,
    // Stateless id-token verification against LINE — no AWS creds, no MINI App secret (the verify
    // endpoint takes only the public channel id).
    verifier: new LineIdTokenVerifier(env.LIFF_CHANNEL_ID),
    presign: s3Presign(s3, env.ARCHIVE_BUCKET),
    logger: consoleLogger,
    now: () => new Date(),
  };
}

// Cold-start singleton (memoised across warm invocations; rejection is intentionally NOT memoised here
// because buildDeps is synchronous — it either throws at module use or returns a value).
let deps: ApiDeps | undefined;
function getDeps(): ApiDeps {
  deps ??= buildDeps();
  return deps;
}

/** Map the Lambda Function URL event to a provider-agnostic HttpRequest (lower-cased header keys;
 * base64-decoded body when the platform classified it as binary). */
function toHttpRequest(event: APIGatewayProxyEventV2): HttpRequest {
  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(event.headers ?? {})) headers[k.toLowerCase()] = v;
  const rawBody =
    event.body === undefined || event.body === null
      ? ""
      : event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
  return {
    method: event.requestContext?.http?.method ?? "GET",
    path: event.rawPath ?? "/",
    headers,
    rawBody,
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleApi(getDeps(), toHttpRequest(event));
}
