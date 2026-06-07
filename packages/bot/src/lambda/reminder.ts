import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { DynamoCatalogRepository } from "../adapters/dynamodb/catalogRepository.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { ReminderSweep } from "../app/reminderSweep.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildReminderSweep(): Promise<ReminderSweep> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the reminder sweep Lambda");
  }
  const channelAccessToken = await loadChannelAccessToken(env);

  const ddb = new DynamoDBClient({});
  const doc = DynamoDBDocumentClient.from(ddb);
  return new ReminderSweep({
    catalog: new DynamoCatalogRepository(doc, env.CATALOG_TABLE),
    gateway: createLineMessagingGateway(channelAccessToken),
    logger: new PowertoolsLoggerAdapter(),
    clock: SYSTEM_CLOCK,
  });
}

// Memoize the built sweep (incl. warm SSM-loaded secret and SDK clients) across invocations.
const getSweep = lazySingleton(buildReminderSweep);

export const handler: ScheduledHandler = async () => {
  await (await getSweep()).run();
};
