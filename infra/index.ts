import * as path from "node:path";
import * as pulumi from "@pulumi/pulumi";
import { createDatabase } from "./src/database";
import { createBotLambdas } from "./src/lambdas";
import { createMiniApp } from "./src/miniapp";
import { createStorage } from "./src/storage";

// The built mini-app SPA directory. Resolved here on purpose: __dirname is the Pulumi project root
// (infra/), so `../packages/miniapp/dist` points at <repo>/packages/miniapp/dist. Moving this into
// src/miniapp.ts would shift __dirname to infra/src/ and silently break the lookup (the SPA upload
// would vanish from the plan with no error). The FileArchive("../packages/bot/dist/*") paths in the
// Lambda modules are different — those are CWD-relative (the project root) and stay correct anywhere.
const MINIAPP_DIST = path.resolve(__dirname, "../packages/miniapp/dist");

// ---------------------------------------------------------------------------
// Wiring: storage → bot lambdas → mini app. References (and dependsOn) build the
// dependency graph, so the call order here is just for readability.
// ---------------------------------------------------------------------------
const storage = createStorage();
const { ingestUrl, sweepFn, reminderFn } = createBotLambdas(storage);
const { readApiUrl, siteDistribution, siteBucket } = createMiniApp(storage, MINIAPP_DIST);
const database = createDatabase();

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const webhookUrl = ingestUrl.functionUrl;
export const messagesTableName = storage.messagesTable.name;
export const idempotencyTableName = storage.idempotencyTable.name;
export const catalogTableName = storage.catalogTable.name;
export const archiveBucketName = storage.archiveBucket.bucket;
export const eventsQueueUrl = storage.eventsQueue.url;
export const deadLetterQueueUrl = storage.dlq.url;
export const sweepFunctionName = sweepFn.name;
export const reminderFunctionName = reminderFn.name;
// Mini app (plan 14): the read-api endpoint (→ VITE_READ_API_URL) + the CloudFront SPA host
// (→ the LIFF Endpoint URL set in the LINE console, and the SPA's public origin).
export const readApiUrlOutput = readApiUrl.functionUrl;
export const miniAppCloudFrontDomain = siteDistribution.domainName;
export const miniAppUrl = pulumi.interpolate`https://${siteDistribution.domainName}/`;
export const miniAppSiteBucket = siteBucket.bucket;
// Stage 1 (plan 19): the v2 Postgres catalog store.
export const dbEndpoint = database.db.endpoint;
export const dbConnectionString = database.connectionString; // secret

