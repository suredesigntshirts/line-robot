import { SQSClient } from "@aws-sdk/client-sqs";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadChannelSecret, loadEnv } from "../adapters/config/config.js";
import { SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import { SqsQueuePublisher } from "../adapters/queue/sqsPublisher.js";
import { handleIngest, type IngestDeps } from "../app/ingestHandler.js";
import { lazySingleton } from "../lib/lazySingleton.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

async function buildDeps(): Promise<IngestDeps> {
  const env = loadEnv();
  if (env.QUEUE_URL === undefined) {
    throw new Error("QUEUE_URL is required for the ingest Lambda");
  }
  const channelSecret = await loadChannelSecret(env);
  return {
    verifier: new SignatureVerifier(channelSecret),
    publisher: new SqsQueuePublisher(new SQSClient({}), env.QUEUE_URL),
    logger: new PowertoolsLoggerAdapter(),
  };
}

const getDeps = lazySingleton(buildDeps);

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleIngest(await getDeps(), event);
}
