import { LINE_SIGNATURE_HTTP_HEADER_NAME } from "@line/bot-sdk";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import type { Logger, QueuePublisher } from "../core/ports/runtime.js";
import type { EventPayload } from "./eventProcessor.js";

export interface IngestDeps {
  readonly verifier: SignatureVerifier;
  readonly publisher: QueuePublisher;
  readonly logger: Logger;
}

function rawBodyOf(event: APIGatewayProxyEventV2): string {
  if (event.body === undefined) {
    return "";
  }
  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}

function extractRawEvents(rawBody: string): Array<{ webhookEventId?: unknown }> {
  const parsed = JSON.parse(rawBody) as { events?: unknown };
  return Array.isArray(parsed.events) ? (parsed.events as Array<{ webhookEventId?: unknown }>) : [];
}

/**
 * Lambda Function URL handler: verify the LINE signature on the RAW body, then enqueue each
 * event for async processing and return 200 immediately (LINE recommends async processing).
 * - invalid/missing signature → 403
 * - empty events (LINE "verify" ping) → 200, nothing enqueued
 * - enqueue failure → 500 so LINE redelivers
 */
export async function handleIngest(
  deps: IngestDeps,
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const signature = event.headers?.[LINE_SIGNATURE_HTTP_HEADER_NAME];
  const rawBody = rawBodyOf(event);

  if (!deps.verifier.verify(rawBody, signature)) {
    deps.logger.warn("rejected webhook with invalid signature");
    return { statusCode: 403, body: "invalid signature" };
  }

  const rawEvents = extractRawEvents(rawBody);
  if (rawEvents.length === 0) {
    return { statusCode: 200, body: "OK" };
  }

  const payloads: EventPayload[] = rawEvents.map((raw) => ({
    webhookEventId: typeof raw.webhookEventId === "string" ? raw.webhookEventId : "",
    raw,
  }));

  await deps.publisher.publish(payloads);
  deps.logger.info("enqueued webhook events", { count: payloads.length });
  return { statusCode: 200, body: "OK" };
}
