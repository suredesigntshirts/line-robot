import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { loadAnthropicApiKey, loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { S3RawArchive } from "../adapters/s3/rawArchive.js";
import { DealflowSweep } from "../app/dealflowSweep.js";
import { IngestionSweep } from "../app/ingestionSweep.js";
import { createPipelineV2Port } from "../app/pipelineV2Sweep.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

/** Both cron-time sweeps that run on the 2-min tick: the ingestion sweep (extract-and-apply) and the
 * Stage-6 dealflow sweep (the exclusivity-lapse release prompt + the quick-quote Flex push). The
 * dealflow work is FOLDED into this existing lambda (no new infra) — it reuses the same Postgres
 * handle + LINE gateway the ingestion sweep already needs (no new IAM). */
interface Sweeps {
  ingestion: IngestionSweep;
  dealflow: DealflowSweep;
}

async function buildSweep(): Promise<Sweeps> {
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
  const db = getDb(env.DATABASE_URL);
  // One gateway, shared: IngestionSweep pushes the post-sweep confirmation, the v2 port pushes the
  // gate-pass claim DM (Stage 5, Build C), and the dealflow sweep pushes the lapse prompt + quote card.
  // MINIAPP_URL deep-links the claim/quote cards to the LIFF screens — absent simply skips those DMs
  // (membership/group population + the postback-only lapse prompt are unaffected).
  const gateway = createLineMessagingGateway(channelAccessToken);
  const v2 = createPipelineV2Port({
    db,
    llm: new AnthropicStepLlm(new Anthropic({ apiKey: anthropicApiKey })),
    media: archive,
    logger,
    gateway,
    miniappUrl: env.MINIAPP_URL,
  });

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  const ingestion = new IngestionSweep({
    // The conversation tracker (claim/debounce/watermark) stays on DynamoDB; the v2 pipeline owns
    // the property catalog in Postgres.
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    messages: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    v2,
    gateway,
    logger,
    clock: SYSTEM_CLOCK,
  });
  // Stage 6 (INC-B4): the dealflow sweep — same db + gateway + clock, plus the MINI App base URL for
  // the quick-quote `/quote/{id}` deep link (absent → the quote push is skipped; the lapse prompt is
  // postback-only and runs regardless).
  const dealflow = new DealflowSweep({
    db,
    gateway,
    logger,
    clock: SYSTEM_CLOCK,
    miniappUrl: env.MINIAPP_URL,
  });
  return { ingestion, dealflow };
}

// Memoize the built sweeps (incl. warm SSM-loaded secrets and SDK clients) across invocations.
const getSweep = lazySingleton(buildSweep);

export const handler: ScheduledHandler = async () => {
  const { ingestion, dealflow } = await getSweep();
  // Ingestion first (it may extract + open new windows), then the dealflow sweep (lapse prompts +
  // quick-quote pushes). The dealflow run is wrapped so a dealflow error never masks the (already
  // completed) ingestion run; both re-run next tick (the cron is at-least-once), so swallowing a
  // dealflow error here only defers that tick's prompts/pushes, never drops them.
  await ingestion.run();
  try {
    await dealflow.run();
  } catch (error) {
    new PowertoolsLoggerAdapter().error("dealflow sweep failed (ingestion already ran)", {
      error: String(error),
    });
  }
};
