import { BatchProcessor, EventType, processPartialResponse } from "@aws-lambda-powertools/batch";
import type { IdempotencyConfig } from "@aws-lambda-powertools/idempotency";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { SQSEvent, SQSHandler, SQSRecord } from "aws-lambda";
import { createClaudeExtractor } from "../adapters/anthropic/claudeExtractor.js";
import { loadAnthropicApiKey, loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import {
  createLineContentClient,
  createLineMessagingGateway,
} from "../adapters/line/lineGateway.js";
import { S3MediaUrlSigner } from "../adapters/s3/mediaUrlSigner.js";
import { S3RawArchive } from "../adapters/s3/rawArchive.js";
import { type EventPayload, EventProcessor } from "../app/eventProcessor.js";
import { createDefaultMessageHandler, createPostbackRouter } from "../core/handlers/registry.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import {
  createIdempotencyConfig,
  createPersistenceLayer,
  makeEventIdempotent,
} from "../lib/idempotency.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

interface Deps {
  processOne: (payload: EventPayload) => Promise<void>;
  idempotencyConfig: IdempotencyConfig;
}

async function buildDeps(): Promise<Deps> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the processor Lambda");
  }
  const channelAccessToken = await loadChannelAccessToken(env);

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  const catalog = new DynamoCatalogRepository(doc, env.CATALOG_TABLE);
  const s3 = new S3Client({});
  // Signs presigned GET URLs for property-card hero images (the archive bucket is private).
  const signer = new S3MediaUrlSigner(s3, env.ARCHIVE_BUCKET);
  const logger = new PowertoolsLoggerAdapter();

  // Enables the free-text "reply to update" edit path. Gated on the Anthropic key being wired to
  // the processor (env + SSM read grant); absent → the handler chain is the command handler alone.
  // CRITICAL: this runs synchronously inside the 30s processor timeout, so it must stay fast — a
  // single Haiku tier (NO escalation ladder) with a hard 12s client timeout and no retries. The
  // ingestion sweep keeps the full Haiku→Sonnet→Opus ladder (it has its own longer-running Lambda).
  const extractor =
    env.ANTHROPIC_API_KEY_PARAM !== undefined
      ? createClaudeExtractor(
          await loadAnthropicApiKey(env),
          [{ model: "claude-haiku-4-5" }],
          logger,
          { timeout: 12_000, maxRetries: 0 },
        )
      : undefined;

  const processor = new EventProcessor({
    archive: new S3RawArchive(s3, env.ARCHIVE_BUCKET),
    repository: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    catalog,
    content: createLineContentClient(channelAccessToken),
    handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor }),
    postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer }),
    gateway: createLineMessagingGateway(channelAccessToken),
    logger,
    clock: SYSTEM_CLOCK,
  });

  const persistence = createPersistenceLayer({
    tableName: env.IDEMPOTENCY_TABLE,
    awsSdkV3Client: ddb,
  });

  // Idempotency keyed on webhookEventId guards against LINE webhook redelivery.
  const idempotencyConfig = createIdempotencyConfig();
  const processOne = makeEventIdempotent(
    (payload: EventPayload) => processor.process(payload),
    persistence,
    idempotencyConfig,
  );

  return { processOne, idempotencyConfig };
}

const getDeps = lazySingleton(buildDeps);

const batchProcessor = new BatchProcessor(EventType.SQS);

export const handler: SQSHandler = async (event: SQSEvent, context) => {
  const { processOne, idempotencyConfig } = await getDeps();
  // Register the Lambda context each invocation so Powertools can set the in-progress
  // idempotency expiry from the remaining execution time (silences the cold-start WARN and
  // lets retries proceed promptly if the processor times out mid-event).
  idempotencyConfig.registerLambdaContext(context);
  const recordHandler = async (record: SQSRecord): Promise<void> => {
    const payload = JSON.parse(record.body) as EventPayload;
    await processOne(payload);
  };
  return processPartialResponse(event, recordHandler, batchProcessor, { context });
};
