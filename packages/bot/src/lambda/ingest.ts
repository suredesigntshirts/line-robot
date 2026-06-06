import { SQSClient } from "@aws-sdk/client-sqs";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadEnv, loadSecrets } from "../adapters/config/config.js";
import { SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import { SqsQueuePublisher } from "../adapters/queue/sqsPublisher.js";
import { handleIngest, type IngestDeps } from "../app/ingestHandler.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

let depsPromise: Promise<IngestDeps> | undefined;

async function buildDeps(): Promise<IngestDeps> {
  const env = loadEnv();
  if (env.QUEUE_URL === undefined) {
    throw new Error("QUEUE_URL is required for the ingest Lambda");
  }
  const secrets = await loadSecrets(env);
  return {
    verifier: new SignatureVerifier(secrets.channelSecret),
    publisher: new SqsQueuePublisher(new SQSClient({}), env.QUEUE_URL),
    logger: new PowertoolsLoggerAdapter(),
  };
}

function getDeps(): Promise<IngestDeps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleIngest(await getDeps(), event);
}
