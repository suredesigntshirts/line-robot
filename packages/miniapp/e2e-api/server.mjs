// REAL-BACKEND e2e server (INC-2) — the Phase-2 net the static gate (e2e/server.mjs) can't be: it
// composes the ACTUAL packages/api `handleApi` over a SEEDED Docker Postgres, so the round-trip specs
// prove real persistence + the real contract (the edit PATCH allowlist, isSaved, group-membership
// authz, claim/publish→consent state), not just optimistic client UI against canned page.route bodies.
//
// It serves three things on ONE port:
//   • the built SPA (`dist-e2e/`, the SAME artifact the static gate uses) via sirv `single:true`;
//   • the api under `/__api/*` — composed exactly like lambda/api.ts's buildDeps() BUT with the test
//     pool, a STUB verifier (fixture token → the seeded LINE subject, everything else → 401), a
//     FAKE-S3 presign (returns a `/__s3/<key>` URL on THIS server), a logger, and a FIXED `now`;
//   • the fake archive under `/__s3/*` — a real small PNG for every presigned key (mirrors the website
//     fake-S3 trick) so the gallery renders with decodable images and no AWS.
//
// The SPA's baked `VITE_API_URL` is `https://e2e.api.local`; the spec helper (support.ts) intercepts
// that origin and FORWARDS each request to `/__api/*` here — reusing dist-e2e + the existing LIFF mock
// (which sends the Bearer token), no second SPA build, no dynamic-port baking.
//
// Needs Docker + a built `dist-e2e/` (the test:e2e:api script builds it).

import { existsSync } from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { dbFromPool } from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import sirv from "sirv";
import { handleApi } from "../../api/src/handler.ts";
import {
  ADMIN_LINE_SUBJECT,
  BROKER_LINE_SUBJECT,
  MEMBER_LINE_SUBJECT,
  OTHER_LINE_SUBJECT,
  SEED_LINE_SUBJECT,
  seed,
} from "./seed.mjs";

const CONTAINER = "linerobot-miniapp-e2e";
const PORT = Number(process.env.E2E_API_PORT || 4331);
const DIST = fileURLToPath(new URL("../dist-e2e", import.meta.url));

if (!existsSync(DIST)) {
  console.error(`[miniapp-e2e-api] missing build at ${DIST} — run \`vite build --mode e2e\` first`);
  process.exit(1);
}

// --- bring up Postgres + seed ----------------------------------------------
const connectionString = await startPostgresLocal(CONTAINER);
const pool = new pg.Pool({ connectionString, max: 4 });
const db = dbFromPool(pool);
await migrateDb(db);
const ids = await seed(db);

// --- the api deps (the buildDeps() recipe, test-substituted seams) ----------

// A real, decodable 1x1 transparent PNG — the fake-S3 body so `assertNoBrokenImages` passes.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

// STUB LineTokenVerifier (the injectable port) — MULTI-IDENTITY (Stage 6, INC-B3). Each fixture token
// maps to ONE seeded LINE subject; `loginAs(page, role)` (support.ts) sets the active token via the LIFF
// mock, so the SPA's Bearer header carries the role's token and the api resolves to the right user. An
// UNKNOWN token → null, so the api's real 401 path stays exercised (auth.spec relies on it). The DEFAULT
// `e2e.fixture.id-token` still maps to `e2e-user` — every pre-Stage-6 spec is unchanged. No network.
const TOKEN_TO_SUBJECT = {
  "e2e.fixture.id-token": SEED_LINE_SUBJECT,
  "e2e.token.member": MEMBER_LINE_SUBJECT,
  "e2e.token.broker": BROKER_LINE_SUBJECT,
  "e2e.token.other": OTHER_LINE_SUBJECT,
  // The ADMIN identity (INC-B3b) — its `approved` admin role passes the server-side `/admin/*` gate.
  "e2e.token.admin": ADMIN_LINE_SUBJECT,
};

const verifier = {
  async verifyIdToken(idToken) {
    const subject = TOKEN_TO_SUBJECT[idToken];
    return subject ? { userId: subject } : null;
  },
};

// FAKE-S3 presign: maps any archive key to a working image URL on THIS server (`/__s3/<key>`). The SPA
// fetches presigned URLs WITHOUT auth and they're localhost, so Playwright doesn't intercept them.
const presign = async (s3Key) => `http://localhost:${PORT}/__s3/${encodeURIComponent(s3Key)}`;

const logger = {
  warn: (message, context) => console.warn(JSON.stringify({ level: "WARN", message, ...context })),
  error: (message, context) =>
    console.error(JSON.stringify({ level: "ERROR", message, ...context })),
};

// FIXED clock — pins the viewings upcoming/past split. Mid-2026 so the seed's 2026-02 claimedAt is
// "past" and a spec booking a 2030 viewing lands in "upcoming" deterministically.
const FIXED_NOW = new Date("2026-06-15T00:00:00Z");

// The production {@link Repo}: every member is the matching @line-robot/db public-barrel fn bound to
// the test `db` — IDENTICAL shape to lambda/api.ts's buildDeps(), built here over the test pool. Imports
// are the public barrel only (no deep db internals), so the harness consumes the real contract.
const {
  findUserByIdentity,
  createUserWithIdentity,
  getPortalListingDetail,
  isGroupMember,
  listMyListings,
  claimListing,
  publishListing,
  keepListingPrivate,
  updateListingFields,
  updateRentalMonthlyRent,
  listSavedListingsForUser,
  saveListing,
  unsaveListing,
  listViewingsForUser,
  createViewing,
  listNotesForUserListing,
  addListingNote,
  // Stage 6 (INC-B3) — the dealflow fns the listing-facing endpoints exercise: `getUserRoles` (the
  // vetted/admin server-side gate behind interest/quote reads), interest flags, quick-sale flag, quotes.
  getUserRoles,
  createInterestFlag,
  listInterestFlags,
  setListingUrgency,
  createQuote,
  listQuotesForListing,
  // Stage 6 (INC-B3b) — the role-application + admin-screen fns (re-added here, mirroring lambda/api.ts's
  // buildDeps): self-service role-application + the caller's own status; the admin vetting queue
  // (list + approve/reject); the admin moderation queue (list pending + resolve).
  applyForRole,
  getLatestRoleApplication,
  listRoleApplications,
  setRoleApproval,
  listPendingModeration,
  resolveModerationItem,
} = await import("@line-robot/db");

const repo = {
  findUserByIdentity: (provider, subject) => findUserByIdentity(db, provider, subject),
  createLineUser: (displayName, subject) =>
    createUserWithIdentity(
      db,
      { displayName },
      { provider: "line", providerSubject: subject, verifiedAt: FIXED_NOW },
    ),
  getPortalListingDetail: (id, callerUserId) => getPortalListingDetail(db, id, callerUserId),
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
  // --- Stage 6 (INC-B3 dealflow) — interest flags, quick-sale, quotes + the vetted/admin gate read ---
  getUserRoles: (userId) => getUserRoles(db, userId),
  createInterestFlag: (listingId, userId) => createInterestFlag(db, listingId, userId),
  listInterestFlags: (listingId) => listInterestFlags(db, listingId),
  setListingUrgency: (id, urgency) => setListingUrgency(db, id, urgency),
  createQuote: (input) => createQuote(db, input),
  listQuotesForListing: (listingId) => listQuotesForListing(db, listingId),
  // --- Stage 6 (INC-B3b) — role application + admin vetting/moderation (mirrors lambda/api.ts) -------
  applyForRole: (userId, kind, prefs) => applyForRole(db, userId, kind, prefs),
  getLatestRoleApplication: (userId) => getLatestRoleApplication(db, userId),
  listRoleApplications: (status) => listRoleApplications(db, status),
  setRoleApproval: (roleId, status, reviewedBy) => setRoleApproval(db, roleId, status, reviewedBy),
  listPendingModeration: () => listPendingModeration(db),
  resolveModerationItem: (id, status) => resolveModerationItem(db, id, status),
};

const deps = { repo, verifier, presign, logger, now: () => FIXED_NOW };

// --- HTTP: /__api → handleApi, /__s3 → fake archive, else SPA --------------

const serveSpa = sirv(DIST, { single: true, dev: false, etag: true });

/** Read the full request body as a UTF-8 string. */
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

/** Map a Node http request (already past the `/__api` prefix) to the api's provider-agnostic
 * HttpRequest — lower-cased header keys (Bearer lookup is case-insensitive), the raw text body. */
function toHttpRequest(req, apiPath, rawBody) {
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k.toLowerCase()] = Array.isArray(v) ? v.join(",") : v;
  }
  return { method: req.method ?? "GET", path: apiPath, headers, rawBody };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = decodeURIComponent(url.pathname);

  // Seed ids — the specs fetch this once to learn which listing plays which role (claimable / mine /
  // claimedByOther / published). Keeps the seed the single source of truth (no baked ids in specs).
  if (path === "/__ids") {
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify(ids));
    return;
  }

  // Fake archive: a real PNG for any presigned key.
  if (path.startsWith("/__s3/")) {
    res.writeHead(200, { "content-type": "image/png", "cache-control": "no-store" });
    res.end(PNG_1X1);
    return;
  }

  // The real api — strip the `/__api` prefix, run handleApi, write its HttpResponse back.
  if (path.startsWith("/__api/") || path === "/__api") {
    const apiPath = path.slice("/__api".length) || "/";
    const rawBody = req.method === "GET" || req.method === "HEAD" ? "" : await readBody(req);
    const response = await handleApi(deps, toHttpRequest(req, apiPath, rawBody));
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  // Everything else → the SPA (single:true falls back to index.html for the /p/{id} routes).
  serveSpa(req, res, () => {
    res.statusCode = 404;
    res.end("not found");
  });
});

server.listen(PORT, () => {
  console.log(
    `[miniapp-e2e-api] http://localhost:${PORT}  (claimable=${ids.listings.claimable} mine=${ids.listings.mine} other=${ids.listings.claimedByOther} published=${ids.listings.published})`,
  );
});

let closing = false;
const shutdown = () => {
  if (closing) return;
  closing = true;
  pool.end().catch(() => {});
  try {
    stopPostgresLocal(CONTAINER);
  } catch {}
  setTimeout(() => process.exit(0), 500);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("exit", () => {
  try {
    stopPostgresLocal(CONTAINER);
  } catch {}
});
