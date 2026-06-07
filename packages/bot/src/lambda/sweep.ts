import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import {
  createClaudeExtractor,
  createClaudeImageClassifier,
} from "../adapters/anthropic/claudeExtractor.js";
import { loadAnthropicApiKey, loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { S3RawArchive } from "../adapters/s3/rawArchive.js";
import { IngestionSweep } from "../app/ingestionSweep.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

const SYSTEM_CLOCK = { now: () => Date.now() };

async function buildSweep(): Promise<IngestionSweep> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the ingestion sweep Lambda");
  }
  const [anthropicApiKey, channelAccessToken] = await Promise.all([
    loadAnthropicApiKey(env),
    loadChannelAccessToken(env),
  ]);

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  const logger = new PowertoolsLoggerAdapter();
  return new IngestionSweep({
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    messages: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    extractor: createClaudeExtractor(anthropicApiKey, undefined, logger),
    // Per-image classify + OCR (plan 13): one cheap Haiku vision call per image.
    classifier: createClaudeImageClassifier(anthropicApiKey, undefined, logger),
    media: new S3RawArchive(new S3Client({}), env.ARCHIVE_BUCKET),
    gateway: createLineMessagingGateway(channelAccessToken),
    logger,
    clock: SYSTEM_CLOCK,
  });
}

// Memoize the built sweep (incl. warm SSM-loaded secrets and SDK clients) across invocations.
let sweepPromise: Promise<IngestionSweep> | undefined;

export const handler: ScheduledHandler = async () => {
  sweepPromise ??= buildSweep();
  await (await sweepPromise).run();
};
