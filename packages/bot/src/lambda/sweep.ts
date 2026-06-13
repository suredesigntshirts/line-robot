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
import { createPipelineV2Port, type PipelineV2Port } from "../app/pipelineV2Sweep.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildSweep(): Promise<IngestionSweep> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the ingestion sweep Lambda");
  }
  const [anthropicApiKey, channelAccessToken] = await Promise.all([
    loadAnthropicApiKey(env),
    loadChannelAccessToken(env),
  ]);

  const logger = new PowertoolsLoggerAdapter();
  // S3RawArchive doubles as the pipeline's MediaStore: it reads originals and writes the image
  // derivatives. One instance backs both the v1 classifier (MediaReader) and the v2 pipeline.
  const archive = new S3RawArchive(new S3Client({}), env.ARCHIVE_BUCKET);

  // PIPELINE_V2 (stage-2 increment 9): flag-gated cutover — sweep extraction runs
  // packages/pipeline and writes Postgres. Default off; v1 path untouched until
  // staging verification (D2.5).
  let v2: PipelineV2Port | undefined;
  if (process.env.PIPELINE_V2 === "on") {
    if (process.env.DATABASE_URL === undefined) {
      throw new Error("PIPELINE_V2=on requires DATABASE_URL");
    }
    const [{ default: Anthropic }, { AnthropicStepLlm }, { getDb }] = await Promise.all([
      import("@anthropic-ai/sdk"),
      import("@line-robot/pipeline"),
      import("@line-robot/db"),
    ]);
    v2 = createPipelineV2Port({
      db: getDb(process.env.DATABASE_URL),
      llm: new AnthropicStepLlm(new Anthropic({ apiKey: anthropicApiKey })),
      media: archive,
      logger,
    });
  }

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  // ClaudeExtractor implements both PropertyExtractor and PropertySegmenter — one instance, two roles.
  const extractor = createClaudeExtractor(anthropicApiKey, undefined, logger);
  return new IngestionSweep({
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    messages: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    extractor,
    segmenter: extractor,
    // Per-image classify + OCR (plan 13): one cheap Haiku vision call per image.
    classifier: createClaudeImageClassifier(anthropicApiKey, undefined, logger),
    media: archive,
    gateway: createLineMessagingGateway(channelAccessToken),
    logger,
    clock: SYSTEM_CLOCK,
    v2,
  });
}

// Memoize the built sweep (incl. warm SSM-loaded secrets and SDK clients) across invocations.
const getSweep = lazySingleton(buildSweep);

export const handler: ScheduledHandler = async () => {
  await (await getSweep()).run();
};
