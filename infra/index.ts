import * as path from "node:path";
import * as pulumi from "@pulumi/pulumi";
import { createAlarms } from "./src/alarms";
import { createDatabase } from "./src/database";
import { createBotLambdas } from "./src/lambdas";
import { createMiniApp } from "./src/miniapp";
import { createStorage } from "./src/storage";
import { createWebsite } from "./src/website";

// The built mini-app SPA directory. Resolved here on purpose: __dirname is the Pulumi project root
// (infra/), so `../packages/miniapp/dist` points at <repo>/packages/miniapp/dist. Moving this into
// src/miniapp.ts would shift __dirname to infra/src/ and silently break the lookup (the SPA upload
// would vanish from the plan with no error). The FileArchive("../packages/bot/dist/*") paths in the
// Lambda modules are different — those are CWD-relative (the project root) and stay correct anywhere.
const MINIAPP_DIST = path.resolve(__dirname, "../packages/miniapp/dist");
// Built Astro client assets (S4-I6) — same __dirname rationale as MINIAPP_DIST.
const WEBSITE_CLIENT_DIST = path.resolve(__dirname, "../packages/website/dist/client");

// ---------------------------------------------------------------------------
// Wiring: storage → bot lambdas → mini app. References (and dependsOn) build the
// dependency graph, so the call order here is just for readability.
// ---------------------------------------------------------------------------
const storage = createStorage();
const database = createDatabase();
const { ingestUrl, processorFn, sweepFn, reminderFn } = createBotLambdas(storage, database);
const { readApiUrl, readApiFn, siteDistribution, siteBucket } = createMiniApp(
  storage,
  MINIAPP_DIST,
  database,
);
const website = createWebsite(database, storage.archiveBucket, WEBSITE_CLIENT_DIST);

// A5 cutover hardening: an SNS topic + an Errors alarm per production Lambda, so a Lambda failing
// is observable rather than silent. The website SSR Lambda is omitted — it serves the public site,
// not the v2 ingestion/catalog path this hardening covers (it has its own gate work, 4.x).
const alarms = createAlarms({ processorFn, sweepFn, reminderFn, readApiFn });

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
// A5: the alarm SNS topic. Subscribe an endpoint to actually receive notifications, e.g.
//   aws sns subscribe --topic-arn <this> --protocol email --notification-endpoint you@example.com
export const alarmTopicArn = alarms.topic.arn;
// Mini app (plan 14): the read-api endpoint (→ VITE_READ_API_URL) + the CloudFront SPA host
// (→ the LIFF Endpoint URL set in the LINE console, and the SPA's public origin).
export const readApiUrlOutput = readApiUrl.functionUrl;
export const miniAppCloudFrontDomain = siteDistribution.domainName;
export const miniAppUrl = pulumi.interpolate`https://${siteDistribution.domainName}/`;
export const miniAppSiteBucket = siteBucket.bucket;
// Stage 1 (plan 19): the v2 Postgres catalog store.
export const dbEndpoint = database.db.endpoint;
export const dbConnectionString = database.connectionString; // secret
// Stage 4 (plan 19): the public website behind CloudFront (SSR Lambda + S3 assets).
// Domain D19 pending — rebuild the website with SITE_URL=<domain> before pointing DNS.
export const websiteCloudFrontDomain = website.distribution.domainName;
export const websiteUrl = pulumi.interpolate`https://${website.distribution.domainName}/`;
