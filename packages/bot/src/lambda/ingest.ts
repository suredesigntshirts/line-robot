import { SQSClient } from "@aws-sdk/client-sqs";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadChannelSecret, loadEnv } from "../adapters/config/config.js";
import { LINE_SIGNATURE_HEADER, SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import { SqsQueuePublisher } from "../adapters/queue/sqsPublisher.js";
import { handleIngest, type IngestDeps } from "../app/ingestHandler.js";
import type { HttpRequest } from "../core/ports/httpGateway.js";
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

/** Map the Lambda Function URL event to a provider-agnostic HttpRequest: decode the (possibly
 * base64) body and forward only the signature header under its canonical lower-cased name. */
function toHttpRequest(event: APIGatewayProxyEventV2): HttpRequest {
  const body =
    event.body === undefined
      ? ""
      : event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
  return {
    method: event.requestContext?.http?.method ?? "POST",
    path: event.rawPath ?? "/",
    headers: { [LINE_SIGNATURE_HEADER]: event.headers?.[LINE_SIGNATURE_HEADER] },
    rawBody: body,
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleIngest(await getDeps(), toHttpRequest(event));
}
