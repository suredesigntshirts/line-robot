import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { LineIdTokenVerifier } from "../adapters/line/lineTokenVerifier.js";
import { S3MediaUrlSigner } from "../adapters/s3/mediaUrlSigner.js";
import { handleReadApi, type ReadApiDeps } from "../app/readApiHandler.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

const SYSTEM_CLOCK = { now: () => Date.now() };

async function buildDeps(): Promise<ReadApiDeps> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the read-api Lambda");
  }
  if (env.LIFF_CHANNEL_ID === undefined) {
    throw new Error("LIFF_CHANNEL_ID is required for the read-api Lambda");
  }

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  const s3 = new S3Client({});
  return {
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    signer: new S3MediaUrlSigner(s3, env.ARCHIVE_BUCKET),
    // Stateless id-token verification against LINE — no AWS creds, no MINI App secret (the verify
    // endpoint takes only the public channel id).
    verifier: new LineIdTokenVerifier(env.LIFF_CHANNEL_ID, SYSTEM_CLOCK),
    logger: new PowertoolsLoggerAdapter(),
    clock: SYSTEM_CLOCK,
  };
}

// Memoize across warm invocations (cold-start singleton, like the other Lambdas).
let depsPromise: Promise<ReadApiDeps> | undefined;

function getDeps(): Promise<ReadApiDeps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleReadApi(await getDeps(), event);
}
