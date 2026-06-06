import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../adapters/dynamodb/messageRepository.js";
import { IngestionSweep } from "../app/ingestionSweep.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

const SYSTEM_CLOCK = { now: () => Date.now() };

function buildSweep(): IngestionSweep {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the ingestion sweep Lambda");
  }
  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  return new IngestionSweep({
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    messages: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    logger: new PowertoolsLoggerAdapter(),
    clock: SYSTEM_CLOCK,
  });
}

// Memoize across warm invocations so the DynamoDB client/connection is reused.
let sweep: IngestionSweep | undefined;

export const handler: ScheduledHandler = async () => {
  sweep ??= buildSweep();
  await sweep.run();
};
