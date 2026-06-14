import { S3Client } from "@aws-sdk/client-s3";
import { getDb } from "@line-robot/db";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { LineIdTokenVerifier } from "../adapters/lineIdTokenVerifier.ts";
import { s3Presign } from "../adapters/s3Presigner.ts";
import { loadApiEnv } from "../config.ts";
import { type ApiDeps, handleApi, type Logger } from "../handler.ts";
import type { HttpRequest } from "../http.ts";
import { realRepo } from "../repo.ts";

// Composition root for the mini-app API Lambda (Function URL). Mirrors packages/bot/src/lambda/read-api:
// it builds the deps once per warm container, maps the Function URL event to our provider-agnostic
// HttpRequest (lower-casing headers so the Bearer lookup is case-insensitive), and delegates to
// handleApi. The v1 read-api Lambda is untouched — this runs in parallel.

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
  return {
    repo: realRepo(getDb(env.DATABASE_URL)),
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

/** Map the Lambda Function URL event to a provider-agnostic HttpRequest (lower-cased header keys). */
function toHttpRequest(event: APIGatewayProxyEventV2): HttpRequest {
  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(event.headers ?? {})) headers[k.toLowerCase()] = v;
  return {
    method: event.requestContext?.http?.method ?? "GET",
    path: event.rawPath ?? "/",
    headers,
    rawBody: event.body ?? "",
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleApi(getDeps(), toHttpRequest(event));
}
