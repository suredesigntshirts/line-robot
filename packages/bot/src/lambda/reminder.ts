import { getDb } from "@line-robot/db";
import type { ScheduledHandler } from "aws-lambda";
import { loadChannelAccessToken, loadEnv } from "../adapters/config/config.js";
import { createLineMessagingGateway } from "../adapters/line/lineGateway.js";
import { PostgresPropertyStore } from "../adapters/postgres/propertyStore.js";
import { ReminderSweep } from "../app/reminderSweep.js";
import { SYSTEM_CLOCK } from "../lib/clock.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildReminderSweep(): Promise<ReminderSweep> {
  const env = loadEnv();
  if (env.DATABASE_URL === undefined) {
    throw new Error("DATABASE_URL is required for the reminder sweep Lambda (v2 catalog reads)");
  }
  const channelAccessToken = await loadChannelAccessToken(env);

  // Follow-up events live in the v2 Postgres catalog now; the reminder only reads/claims events and
  // reads the listing to render the push — all PropertyStore, no DynamoDB.
  return new ReminderSweep({
    catalog: new PostgresPropertyStore(getDb(env.DATABASE_URL)),
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
