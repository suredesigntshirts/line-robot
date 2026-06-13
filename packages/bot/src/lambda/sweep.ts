import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { loadAnthropicApiKey, loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { S3RawArchive } from "../adapters/s3/rawArchive.js";
import { IngestionSweep } from "../app/ingestionSweep.js";
import { createPipelineV2Port } from "../app/pipelineV2Sweep.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildSweep(): Promise<IngestionSweep> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the ingestion sweep Lambda");
  }
  if (env.DATABASE_URL === undefined) {
    throw new Error(
      "DATABASE_URL is required for the ingestion sweep Lambda (v2 pipeline → Postgres)",
    );
  }
  const [anthropicApiKey, channelAccessToken] = await Promise.all([
    loadAnthropicApiKey(env),
    loadChannelAccessToken(env),
  ]);

  const logger = new PowertoolsLoggerAdapter();
  // S3RawArchive is the pipeline's MediaStore: it reads originals and writes the image derivatives.
  const archive = new S3RawArchive(new S3Client({}), env.ARCHIVE_BUCKET);

  // The sweep delegates extract-and-apply to the v2 pipeline (packages/pipeline → Postgres): each
  // claimed batch is segmented, extracted, deduped, translated, gated, and written to the catalog.
  // Imported dynamically so the heavy pipeline deps (incl. sharp) load only in the sweep bundle.
  const [{ default: Anthropic }, { AnthropicStepLlm }, { getDb }] = await Promise.all([
    import("@anthropic-ai/sdk"),
    import("@line-robot/pipeline"),
    import("@line-robot/db"),
  ]);
  const v2 = createPipelineV2Port({
    db: getDb(env.DATABASE_URL),
    llm: new AnthropicStepLlm(new Anthropic({ apiKey: anthropicApiKey })),
    media: archive,
    logger,
  });

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  return new IngestionSweep({
    // The conversation tracker (claim/debounce/watermark) stays on DynamoDB; the v2 pipeline owns
    // the property catalog in Postgres.
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    messages: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    v2,
    gateway: createLineMessagingGateway(channelAccessToken),
    logger,
    clock: SYSTEM_CLOCK,
  });
}

// Memoize the built sweep (incl. warm SSM-loaded secrets and SDK clients) across invocations.
const getSweep = lazySingleton(buildSweep);

export const handler: ScheduledHandler = async () => {
  await (await getSweep()).run();
};
