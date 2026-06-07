import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadReadApiEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { LineIdTokenVerifier } from "../adapters/line/lineTokenVerifier.js";
import { S3MediaUrlSigner } from "../adapters/s3/mediaUrlSigner.js";
import { handleReadApi, type ReadApiDeps } from "../app/readApiHandler.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildDeps(): Promise<ReadApiDeps> {
  const env = loadReadApiEnv();

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
const getDeps = lazySingleton(buildDeps);

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleReadApi(await getDeps(), event);
}
