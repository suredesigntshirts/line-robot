import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SignatureVerifier } from "../../src/adapters/line/signatureVerifier.js";
import { handleIngest, type IngestDeps } from "../../src/app/ingestHandler.js";
import type { HttpRequest } from "../../src/core/ports/httpGateway.js";
import type { Logger, QueuePublisher } from "../../src/core/ports/runtime.js";

const SECRET = "test-secret";
const sign = (body: string) => createHmac("sha256", SECRET).update(body).digest("base64");
const noopLogger: Logger = { info: () => {}, warn: () => {}, error: () => {} };

// Mirrors lambda/ingest.ts toHttpRequest: when base64-encoded, the lambda decodes before the handler
// ever sees it, so the handler's rawBody is always the decoded body (round-tripped here).
function event(body: string, signature?: string, isBase64Encoded = false): HttpRequest {
  const transported = isBase64Encoded ? Buffer.from(body).toString("base64") : body;
  return {
    method: "POST",
    path: "/",
    headers: signature === undefined ? {} : { "x-line-signature": signature },
    rawBody: isBase64Encoded ? Buffer.from(transported, "base64").toString("utf8") : transported,
  };
}

const messageBody = JSON.stringify({
  destination: "U1",
  events: [
    {
      type: "message",
      webhookEventId: "e1",
      timestamp: 1,
      source: { type: "user", userId: "U1" },
      replyToken: "r",
      message: { type: "text", id: "m1", text: "hi" },
    },
  ],
});

function captureDeps(): { deps: IngestDeps; published: unknown[][] } {
  const published: unknown[][] = [];
  const publisher: QueuePublisher = {
    publish: async (events) => {
      published.push([...events]);
    },
  };
  return {
    deps: { verifier: new SignatureVerifier(SECRET), publisher, logger: noopLogger },
    published,
  };
}

describe("handleIngest", () => {
  it("verifies, enqueues events, and returns 200", async () => {
    const { deps, published } = captureDeps();
    const res = await handleIngest(deps, event(messageBody, sign(messageBody)));
    expect(res).toMatchObject({ statusCode: 200 });
    expect(published).toHaveLength(1);
    expect(published[0]).toHaveLength(1);
    const payload = published[0]?.[0] as { webhookEventId: string };
    expect(payload.webhookEventId).toBe("e1");
  });

  it("returns 200 without enqueueing for an empty verify ping", async () => {
    const { deps, published } = captureDeps();
    const body = JSON.stringify({ destination: "U1", events: [] });
    const res = await handleIngest(deps, event(body, sign(body)));
    expect(res).toMatchObject({ statusCode: 200 });
    expect(published).toHaveLength(0);
  });

  it("rejects an invalid signature with 403 and enqueues nothing", async () => {
    const { deps, published } = captureDeps();
    const res = await handleIngest(deps, event(messageBody, "bad-signature"));
    expect(res).toMatchObject({ statusCode: 403 });
    expect(published).toHaveLength(0);
  });

  it("decodes base64-encoded bodies before verifying", async () => {
    const { deps, published } = captureDeps();
    const res = await handleIngest(deps, event(messageBody, sign(messageBody), true));
    expect(res).toMatchObject({ statusCode: 200 });
    expect(published).toHaveLength(1);
  });

  it("propagates enqueue failures so LINE redelivers", async () => {
    const publisher: QueuePublisher = {
      publish: async () => {
        throw new Error("sqs down");
      },
    };
    const deps: IngestDeps = {
      verifier: new SignatureVerifier(SECRET),
      publisher,
      logger: noopLogger,
    };
    await expect(handleIngest(deps, event(messageBody, sign(messageBody)))).rejects.toThrow(
      /sqs down/,
    );
  });
});
