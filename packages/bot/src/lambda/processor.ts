import { BatchProcessor, EventType, processPartialResponse } from "@aws-lambda-powertools/batch";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { SQSEvent, SQSHandler, SQSRecord } from "aws-lambda";
import { loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { S3RawArchive } from "../adapters/s3/rawArchive.js";
import { type EventPayload, EventProcessor } from "../app/eventProcessor.js";
import { createDefaultMessageHandler } from "../core/handlers/registry.js";
import type { IdempotencyConfig } from "@aws-lambda-powertools/idempotency";
import {
  createIdempotencyConfig,
  createPersistenceLayer,
  makeEventIdempotent,
} from "../lib/idempotency.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

const SYSTEM_CLOCK = { now: () => Date.now() };

interface Deps {
  processOne: (payload: EventPayload) => Promise<void>;
  idempotencyConfig: IdempotencyConfig;
}

let depsPromise: Promise<Deps> | undefined;

async function buildDeps(): Promise<Deps> {
  const env = loadEnv();
  const channelAccessToken = await loadChannelAccessToken(env);

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);

  const processor = new EventProcessor({
    archive: new S3RawArchive(new S3Client({}), env.ARCHIVE_BUCKET),
    repository: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    handler: createDefaultMessageHandler(),
    gateway: createLineMessagingGateway(channelAccessToken),
    logger: new PowertoolsLoggerAdapter(),
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

function getDeps(): Promise<Deps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}

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
