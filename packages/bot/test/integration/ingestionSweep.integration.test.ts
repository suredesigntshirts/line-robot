import { CreateTableCommand, type DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DynamoCatalogRepository } from "../../src/adapters/dynamodb/catalogRepository.js";
import { DynamoMessageRepository } from "../../src/adapters/dynamodb/messageRepository.js";
import { IngestionSweep } from "../../src/app/ingestionSweep.js";
import type { ConversationRef } from "../../src/core/domain/conversation.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import type {
  ExtractionResult,
  ImageClassifier,
  PropertyExtractor,
  PropertySegmenter,
} from "../../src/core/ports/extraction.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { MediaReader } from "../../src/core/ports/mediaReader.js";
import { textOf } from "../fixtures/outbound.js";
import { startDynamoDBLocal, stopDynamoDBLocal } from "./dynamodbLocal.js";

const CONTAINER = "linerobot-ddb-sweep-it";
const CATALOG_TABLE = "catalog-test";
const MESSAGES_TABLE = "messages-test";

async function createTables(client: DynamoDBClient): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: CATALOG_TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "gsi1pk", AttributeType: "S" },
        { AttributeName: "gsi1sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "gsi1",
          KeySchema: [
            { AttributeName: "gsi1pk", KeyType: "HASH" },
            { AttributeName: "gsi1sk", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    }),
  );
  await client.send(
    new CreateTableCommand({
      TableName: MESSAGES_TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
    }),
  );
}

let ddb: DynamoDBClient;
let doc: DynamoDBDocumentClient;
let catalog: DynamoCatalogRepository;
let messages: DynamoMessageRepository;

// A clock the sweep reads, advanced by hand so the debounce/cap math is plain milliseconds.
const clock = { value: 0, now: () => clock.value };

// Push targets captured by the stub gateway (reset per test that cares).
let pushes: { to: string; messages: OutboundMessage[] }[] = [];

// A media reader that never has anything (the integration messages are text-only).
const noMedia: MediaReader = {
  getMedia: async (key) => {
    throw new Error(`unexpected media read: ${key}`);
  },
};

// By default the extractor returns nothing — keeps the mechanics tests focused on claim/watermark.
const nullExtractor: PropertyExtractor = { extract: async () => null };

// The integration messages are text-only, so no image is ever classified.
const noClassifier: ImageClassifier = {
  classifyImage: async () => {
    throw new Error("unexpected classify call");
  },
};

// Segmentation returns null → the sweep uses its single-pass fallback (what these tests assert).
const nullSegmenter: PropertySegmenter = { segment: async () => null };

function makeSweep(extractor: PropertyExtractor = nullExtractor): IngestionSweep {
  return new IngestionSweep(
    {
      catalog,
      messages,
      extractor,
      segmenter: nullSegmenter,
      classifier: noClassifier,
      media: noMedia,
      gateway: {
        reply: async () => {},
        push: async (to, msgs) => {
          pushes.push({ to, messages: msgs });
        },
        isPermanentError: () => false,
      } as LineGateway,
      logger: { info: () => {}, warn: () => {}, error: () => {} },
      clock,
      newId: () => "fixed-prop-id",
    },
    { staleTimeoutMs: 60_000 },
  );
}

beforeAll(async () => {
  const local = await startDynamoDBLocal(CONTAINER);
  ddb = local.client;
  doc = local.doc;
  await createTables(ddb);
  // Small debounce windows: quiet 1s, cap 5s.
  catalog = new DynamoCatalogRepository(doc, CATALOG_TABLE, {
    quietDebounceMs: 1000,
    maxWaitMs: 5000,
  });
  messages = new DynamoMessageRepository(doc, MESSAGES_TABLE);
});

afterAll(() => {
  stopDynamoDBLocal(CONTAINER);
});

async function arrive(ref: ConversationRef, key: string, messageId: string, timestamp: number) {
  const stored: StoredMessage = {
    ref,
    messageId,
    direction: "in",
    contentType: "text",
    text: messageId,
    timestamp,
  };
  await messages.save(stored);
  await catalog.touchConversation(key, timestamp);
}

describe("IngestionSweep (end-to-end on DynamoDB Local)", () => {
  it("ingests a due conversation, advances the watermark, and drops it from the GSI", async () => {
    const ref = { kind: "user", userId: "Usweep" } as const;
    const key = "user#Usweep";
    await arrive(ref, key, "s1", 1000); // readyAt 2000
    await arrive(ref, key, "s2", 1500); // readyAt 2500

    // Not yet quiet — nothing due, nothing claimed.
    clock.value = 2000;
    expect(await makeSweep().run()).toMatchObject({ due: 0, ingested: 0 });

    // Past the quiet window: the whole burst ingests as one batch.
    clock.value = 3000;
    const swept = await makeSweep().run();
    expect(swept).toMatchObject({ due: 1, ingested: 1, messages: 2 });

    const tracker = await catalog.getConversation(key);
    expect(tracker?.lastIngestedAt).toBe(1500); // watermark = newest message
    expect(tracker?.status).toBe("IDLE");
    expect(tracker?.pendingSince).toBeUndefined(); // cleared → out of GSI1

    // A second sweep finds nothing (it dropped out of the pending index).
    clock.value = 4000;
    expect(await makeSweep().run()).toMatchObject({ due: 0, ingested: 0 });
  });

  it("sweeps only the remainder after a new message re-arms a clean conversation", async () => {
    const ref = { kind: "user", userId: "Uremainder" } as const;
    const key = "user#Uremainder";
    await arrive(ref, key, "r1", 1000);

    clock.value = 3000;
    expect(await makeSweep().run()).toMatchObject({ ingested: 1, messages: 1 });
    expect((await catalog.getConversation(key))?.lastIngestedAt).toBe(1000);

    // A fresh message lands after the clean ingest → re-arms pending at readyAt 5000.
    await arrive(ref, key, "r2", 4000);
    clock.value = 4500;
    expect(await makeSweep().run()).toMatchObject({ due: 0 }); // still within the quiet window

    clock.value = 5000;
    const swept = await makeSweep().run();
    // Only the message after the watermark (r2) is batched — r1 is not re-ingested.
    expect(swept).toMatchObject({ ingested: 1, messages: 1 });
    expect((await catalog.getConversation(key))?.lastIngestedAt).toBe(4000);
  });

  it("does not double-ingest: a second concurrent sweep skips the claimed conversation", async () => {
    const ref = { kind: "user", userId: "Uconcurrent" } as const;
    const key = "user#Uconcurrent";
    await arrive(ref, key, "c1", 1000);

    clock.value = 3000;
    // Two sweeps race on the same due conversation. The conditional claim is exclusive, so whoever
    // claims second either is locked out (status INGESTING) or claims after release (empty batch).
    // Either way the message is batched exactly once — never double-ingested.
    const [a, b] = await Promise.all([makeSweep().run(), makeSweep().run()]);
    expect(a.messages + b.messages).toBe(1);
    expect(a.ingested + b.ingested).toBeGreaterThanOrEqual(1);
    expect((await catalog.getConversation(key))?.lastIngestedAt).toBe(1000);
  });

  it("applies extraction: upserts the property, links it, and pushes a confirmation", async () => {
    const ref = { kind: "user", userId: "Uextract" } as const;
    const key = "user#Uextract";
    await arrive(ref, key, "x1", 1000);

    const extractor: PropertyExtractor = {
      extract: async (): Promise<ExtractionResult> => ({
        properties: [
          {
            existingPropertyId: "",
            ambiguous: false,
            ambiguousWith: [],
            normalizedAddress: "123 Sukhumvit",
            rawAddress: "123 sukhumvit rd",
            projectName: "",
            lat: 13.7,
            long: 100.5,
            district: "",
            subdistrict: "",
            province: "Bangkok",
            propertyType: "condo",
            status: "lead",
            askingPrice: 5_500_000,
            currency: "THB",
            tags: ["near-bts"],
            bedrooms: null,
            bathrooms: null,
            usableAreaSqm: null,
            landArea: "",
            floors: null,
            furnishing: "",
            notes: "",
            listingType: "",
            rentPrice: null,
            contact: "",
            source: "",
          },
        ],
      }),
    };

    pushes = [];
    clock.value = 3000;
    const swept = await makeSweep(extractor).run();
    expect(swept).toMatchObject({ ingested: 1, properties: 1 });

    // The Conv→Property edge was written, and the property carries the extracted fields.
    const propertyIds = await catalog.listConversationProperties(key);
    expect(propertyIds).toEqual(["fixed-prop-id"]);
    const property = await catalog.getProperty("fixed-prop-id");
    expect(property).toMatchObject({
      propertyId: "fixed-prop-id",
      normalizedAddress: "123 Sukhumvit",
      rawAddresses: ["123 sukhumvit rd"],
      province: "Bangkok",
      propertyType: "condo",
      askingPrice: 5_500_000,
      currency: "THB",
      tags: ["near-bts"],
      originConversationKey: key,
    });

    // A push confirmation went to the conversation, and the tracker dropped out of the GSI.
    expect(pushes).toHaveLength(1);
    expect(pushes[0]?.to).toBe("Uextract");
    expect(textOf(pushes[0]?.messages[0])).toContain("123 Sukhumvit (new)");
    expect((await catalog.getConversation(key))?.pendingSince).toBeUndefined();
  });

  it("ingests a mixed-case GROUP conversation end-to-end after the casing fix", async () => {
    const ref = { kind: "group", groupId: "CGroupXYZ7", senderUserId: "Umember" } as const;
    const key = "group#CGroupXYZ7";
    await arrive(ref, key, "gm1", 1000);
    await arrive(ref, key, "gm2", 1500);

    // findSince (the sweep's read path) must find both messages under the case-preserved key.
    expect((await messages.findSince(key, 0)).map((m) => m.text)).toEqual(["gm1", "gm2"]);

    clock.value = 3000;
    const swept = await makeSweep().run();
    // due=1 (the group conversation is past its quiet window) and both messages are batched —
    // proving the catalog tracker key (raw CONV#<key>) and the messages key now agree on case.
    expect(swept).toMatchObject({ due: 1, ingested: 1, messages: 2 });
    expect((await catalog.getConversation(key))?.lastIngestedAt).toBe(1500);
  });
});
