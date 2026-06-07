import { describe, expect, it } from "vitest";
import { IngestionSweep } from "../../src/app/ingestionSweep.js";
import type {
  ConversationTracker,
  Property,
  PropertyUpsert,
} from "../../src/core/domain/catalog.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import type { CatalogRepository } from "../../src/core/ports/catalog.js";
import type {
  ExtractedProperty,
  ExtractionRequest,
  ExtractionResult,
} from "../../src/core/ports/extraction.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { MediaReader } from "../../src/core/ports/mediaReader.js";
import type { MessageRepository } from "../../src/core/ports/persistence.js";
import { textOf } from "../fixtures/outbound.js";

interface Spies {
  claims: { key: string; nowMs: number; staleTimeoutMs: number }[];
  releases: { key: string; watermark: number; claimSeenInboundAt: number }[];
  extractRequests: ExtractionRequest[];
  upserts: PropertyUpsert[];
  links: { key: string; propertyId: string }[];
  pushes: { to: string; messages: OutboundMessage[] }[];
  mediaReads: string[];
  memoryWrites: { key: string; content: string }[];
  errors: string[];
  warns: string[];
}

interface ConvScript {
  tracker: ConversationTracker;
  claim: ConversationTracker | null;
  batch: StoredMessage[] | Error;
}

interface Options {
  /** Per-conversation extraction behavior; returns the result or throws. Default: null (no props). */
  extract?: (req: ExtractionRequest) => ExtractionResult | null;
  /** Existing properties keyed by id (for dedup candidate loading). */
  properties?: Record<string, Property>;
  /** conversationKey → property ids (the Conv→Property edges). */
  convProperties?: Record<string, string[]>;
  /** s3Key → bytes; a missing key throws (simulating a vanished object). */
  mediaBytes?: Record<string, Buffer>;
  /** conversationKey → existing memory note fed to the extractor. */
  memory?: Record<string, string>;
  pushThrows?: boolean;
}

function tracker(key: string, over: Partial<ConversationTracker> = {}): ConversationTracker {
  return { conversationKey: key, lastInboundAt: 500, lastIngestedAt: 100, status: "IDLE", ...over };
}

function textMsg(timestamp: number, text = "hi"): StoredMessage {
  return {
    ref: { kind: "user", userId: "U" },
    messageId: `m${timestamp}`,
    direction: "in",
    contentType: "text",
    text,
    timestamp,
  };
}

function imageMsg(timestamp: number, s3Key: string): StoredMessage {
  return {
    ref: { kind: "user", userId: "U" },
    messageId: `img${timestamp}`,
    direction: "in",
    contentType: "image",
    attachment: { s3Key, contentType: "image/jpeg" },
    timestamp,
  };
}

function extracted(over: Partial<ExtractedProperty> = {}): ExtractedProperty {
  return {
    existingPropertyId: null,
    ambiguous: false,
    ambiguousWith: null,
    normalizedAddress: null,
    rawAddress: null,
    projectName: null,
    lat: null,
    long: null,
    district: null,
    subdistrict: null,
    province: null,
    propertyType: null,
    status: null,
    askingPrice: null,
    currency: null,
    tags: null,
    ...over,
  };
}

function makeSweep(scripts: ConvScript[], opts: Options = {}, nowMs = 10_000) {
  const spies: Spies = {
    claims: [],
    releases: [],
    extractRequests: [],
    upserts: [],
    links: [],
    pushes: [],
    mediaReads: [],
    memoryWrites: [],
    errors: [],
    warns: [],
  };
  const byKey = new Map(scripts.map((s) => [s.tracker.conversationKey, s]));
  let idCounter = 0;

  const catalog: Partial<CatalogRepository> = {
    findPendingConversations: async () => scripts.map((s) => s.tracker),
    claimConversation: async (key, claimNowMs, staleTimeoutMs) => {
      spies.claims.push({ key, nowMs: claimNowMs, staleTimeoutMs });
      return byKey.get(key)?.claim ?? null;
    },
    releaseConversation: async (key, o) => {
      spies.releases.push({ key, ...o });
    },
    listConversationProperties: async (key) => opts.convProperties?.[key] ?? [],
    getProperty: async (id) => opts.properties?.[id] ?? null,
    upsertProperty: async (input) => {
      spies.upserts.push(input);
    },
    linkConversationProperty: async (key, propertyId) => {
      spies.links.push({ key, propertyId });
    },
    getMemoryDoc: async (key) => opts.memory?.[key] ?? null,
    putMemoryDoc: async (key, content) => {
      spies.memoryWrites.push({ key, content });
    },
  };
  const messages: Partial<MessageRepository> = {
    findSince: async (key) => {
      const batch = byKey.get(key)?.batch ?? [];
      if (batch instanceof Error) {
        throw batch;
      }
      return batch;
    },
  };
  const media: MediaReader = {
    getMedia: async (s3Key) => {
      spies.mediaReads.push(s3Key);
      const bytes = opts.mediaBytes?.[s3Key];
      if (bytes === undefined) {
        throw new Error(`missing ${s3Key}`);
      }
      return bytes;
    },
  };
  const sweep = new IngestionSweep(
    {
      catalog: catalog as CatalogRepository,
      messages: messages as MessageRepository,
      extractor: {
        extract: async (req) => {
          spies.extractRequests.push(req);
          return (opts.extract ?? (() => null))(req);
        },
      },
      media,
      gateway: {
        reply: async () => {},
        push: async (to, msgs) => {
          if (opts.pushThrows) {
            throw new Error("push failed");
          }
          spies.pushes.push({ to, messages: msgs });
        },
      } as LineGateway,
      logger: {
        info: () => {},
        warn: (m) => spies.warns.push(m),
        error: (m) => spies.errors.push(m),
      },
      clock: { now: () => nowMs },
      newId: () => {
        idCounter += 1;
        return `gen-${idCounter}`;
      },
    },
    { maxConversations: 10, staleTimeoutMs: 1000 },
  );
  return { sweep, spies };
}

describe("IngestionSweep — mechanics", () => {
  it("does nothing when no conversations are due", async () => {
    const { sweep, spies } = makeSweep([]);
    const result = await sweep.run();
    expect(result).toMatchObject({ due: 0, claimed: 0, ingested: 0, properties: 0 });
    expect(spies.claims).toHaveLength(0);
  });

  it("batches and releases, advancing the watermark to the newest message", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#A"),
        claim: tracker("user#A", { lastInboundAt: 500, lastIngestedAt: 100 }),
        batch: [textMsg(200), textMsg(300), textMsg(500)],
      },
    ]);
    const result = await sweep.run();
    expect(result).toMatchObject({ ingested: 1, messages: 3, properties: 0 });
    expect(spies.releases).toEqual([{ key: "user#A", watermark: 500, claimSeenInboundAt: 500 }]);
  });

  it("skips a contended conversation (no batch, no release)", async () => {
    const { sweep, spies } = makeSweep([
      { tracker: tracker("user#B"), claim: null, batch: [textMsg(200)] },
    ]);
    expect(await sweep.run()).toMatchObject({ skipped: 1, ingested: 0 });
    expect(spies.releases).toHaveLength(0);
  });

  it("releases with the existing watermark on an empty batch", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#C"),
        claim: tracker("user#C", { lastInboundAt: 700, lastIngestedAt: 400 }),
        batch: [],
      },
    ]);
    expect(await sweep.run()).toMatchObject({ ingested: 1, properties: 0 });
    expect(spies.releases).toEqual([{ key: "user#C", watermark: 400, claimSeenInboundAt: 700 }]);
    expect(spies.extractRequests).toHaveLength(0); // nothing to extract → extractor not called
  });

  it("records a failure and leaves the claim when batching throws", async () => {
    const { sweep, spies } = makeSweep([
      { tracker: tracker("user#D"), claim: tracker("user#D"), batch: new Error("dynamo down") },
    ]);
    expect(await sweep.run()).toMatchObject({ failed: 1, ingested: 0 });
    expect(spies.releases).toHaveLength(0);
    expect(spies.errors).toHaveLength(1);
  });
});

describe("IngestionSweep — extraction", () => {
  const batch = [
    textMsg(200, "2-bed condo at 123 Sukhumvit, 5.5M https://maps.google.com/?q=13.7,100.5"),
  ];

  it("creates a new property, links it to the conversation, and pushes a confirmation", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#E"), claim: tracker("user#E"), batch }],
      {
        extract: () => ({
          properties: [
            extracted({
              normalizedAddress: "123 Sukhumvit",
              askingPrice: 5_500_000,
              currency: "THB",
            }),
          ],
        }),
      },
    );
    const result = await sweep.run();

    expect(result).toMatchObject({ ingested: 1, properties: 1 });
    expect(spies.upserts).toHaveLength(1);
    expect(spies.upserts[0]).toMatchObject({
      propertyId: "gen-1",
      normalizedAddress: "123 Sukhumvit",
      askingPrice: 5_500_000,
      originConversationKey: "user#E", // set only for new properties
    });
    expect(spies.upserts[0]?.createdAt).toBeDefined();
    expect(spies.links).toEqual([{ key: "user#E", propertyId: "gen-1" }]);
    expect(spies.pushes[0]?.to).toBe("U");
    expect(textOf(spies.pushes[0]?.messages[0])).toContain("123 Sukhumvit (new)");

    // Geo mined from the maps link + (empty) candidate set reach the extractor.
    expect(spies.extractRequests[0]?.geoHints).toEqual([{ lat: 13.7, long: 100.5 }]);
    expect(spies.extractRequests[0]?.candidates).toEqual([]);
  });

  it("feeds the stored memory note to the extractor and persists a proposed update", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#M"), claim: tracker("user#M"), batch }],
      {
        memory: { "user#M": "Khun Mali is the seller." },
        extract: () => ({
          properties: [extracted({ normalizedAddress: "123 Sukhumvit" })],
          memoryUpdate: "Khun Mali is the seller. Prefers viewings on weekends.",
        }),
      },
    );
    await sweep.run();

    expect(spies.extractRequests[0]?.memory).toBe("Khun Mali is the seller.");
    expect(spies.memoryWrites).toEqual([
      { key: "user#M", content: "Khun Mali is the seller. Prefers viewings on weekends." },
    ]);
  });

  it("persists a memory update even when no properties changed, and skips a null update", async () => {
    const aliasOnly = makeSweep(
      [{ tracker: tracker("user#M2"), claim: tracker("user#M2"), batch: [textMsg(200, "fyi")] }],
      { extract: () => ({ properties: [], memoryUpdate: "'the plot' = PROP#abc." }) },
    );
    expect(await aliasOnly.sweep.run()).toMatchObject({ ingested: 1, properties: 0 });
    expect(aliasOnly.spies.memoryWrites).toEqual([
      { key: "user#M2", content: "'the plot' = PROP#abc." },
    ]);

    const nullUpdate = makeSweep(
      [{ tracker: tracker("user#M3"), claim: tracker("user#M3"), batch: [textMsg(200, "fyi")] }],
      { extract: () => ({ properties: [], memoryUpdate: null }) },
    );
    await nullUpdate.sweep.run();
    expect(nullUpdate.spies.memoryWrites).toEqual([]); // null update → no write
  });

  it("updates a matched property without stamping a new origin/createdAt", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#F"), claim: tracker("user#F"), batch: [textMsg(200, "now 6M")] }],
      {
        convProperties: { "user#F": ["p-existing"] },
        properties: {
          "p-existing": { propertyId: "p-existing", normalizedAddress: "123 Sukhumvit" },
        },
        extract: () => ({
          properties: [
            extracted({
              existingPropertyId: "p-existing",
              normalizedAddress: "123 Sukhumvit",
              askingPrice: 6_000_000,
            }),
          ],
        }),
      },
    );
    await sweep.run();

    expect(spies.upserts[0]).toMatchObject({ propertyId: "p-existing", askingPrice: 6_000_000 });
    expect(spies.upserts[0]?.originConversationKey).toBeUndefined();
    expect(spies.upserts[0]?.createdAt).toBeUndefined();
    // The existing property is offered as a dedup candidate.
    expect(spies.extractRequests[0]?.candidates).toEqual([
      {
        propertyId: "p-existing",
        normalizedAddress: "123 Sukhumvit",
        projectName: undefined,
        lat: undefined,
        long: undefined,
      },
    ]);
    expect(textOf(spies.pushes[0]?.messages[0])).toContain("123 Sukhumvit (updated)");
  });

  it("creates new and flags ambiguous matches for confirmation", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#G"), claim: tracker("user#G"), batch }],
      {
        extract: () => ({ properties: [extracted({ ambiguous: true, projectName: "The Park" })] }),
      },
    );
    await sweep.run();
    expect(spies.upserts[0]).toMatchObject({
      propertyId: "gen-1",
      originConversationKey: "user#G",
    });
    expect(textOf(spies.pushes[0]?.messages[0])).toContain("The Park (new — please confirm)");
    // No existing properties in this conversation → nothing to merge into → no quick replies.
    const msg = spies.pushes[0]?.messages[0];
    expect(msg?.type === "text" && msg.quickReplies).toBeFalsy();
  });

  it("offers merge / keep-separate quick replies when an ambiguous match has candidates", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#G"), claim: tracker("user#G"), batch }],
      {
        convProperties: { "user#G": ["p-existing"] },
        properties: {
          "p-existing": { propertyId: "p-existing", normalizedAddress: "Thonglor plot" },
        },
        extract: () => ({ properties: [extracted({ ambiguous: true, projectName: "The Park" })] }),
      },
    );
    await sweep.run();

    const msg = spies.pushes[0]?.messages[0];
    if (msg?.type !== "text" || msg.quickReplies === undefined) {
      throw new Error("expected a text confirmation with quick replies");
    }
    expect(msg.quickReplies[0]).toEqual({
      label: "Merge → Thonglor plot",
      data: "action=merge&from=gen-1&into=p-existing",
    });
    expect(msg.quickReplies.at(-1)).toEqual({
      label: "Keep separate",
      data: "action=keep&id=gen-1",
    });
  });

  it("narrows the merge offer to the model's ambiguousWith hint", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#GH"), claim: tracker("user#GH"), batch }],
      {
        convProperties: { "user#GH": ["p-thonglor", "p-rama9"] },
        properties: {
          "p-thonglor": { propertyId: "p-thonglor", normalizedAddress: "Thonglor plot" },
          "p-rama9": { propertyId: "p-rama9", normalizedAddress: "Rama IX condo" },
        },
        // The model is only torn between the Thonglor plot — not the Rama IX condo.
        extract: () => ({
          properties: [extracted({ ambiguous: true, ambiguousWith: ["p-thonglor"] })],
        }),
      },
    );
    await sweep.run();

    const msg = spies.pushes[0]?.messages[0];
    if (msg?.type !== "text" || msg.quickReplies === undefined) {
      throw new Error("expected a text confirmation with quick replies");
    }
    // Only the hinted candidate is offered (plus Keep separate) — the Rama IX condo is excluded.
    const mergeChips = msg.quickReplies.filter((q) => q.label.startsWith("Merge →"));
    expect(mergeChips).toEqual([
      { label: "Merge → Thonglor plot", data: "action=merge&from=gen-1&into=p-thonglor" },
    ]);
  });

  it("attributes a single-property batch's photo to that property", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#P"),
          claim: tracker("user#P"),
          batch: [textMsg(100, "a condo"), imageMsg(200, "conv/P/img/content")],
        },
      ],
      {
        mediaBytes: { "conv/P/img/content": Buffer.from("jpg") },
        extract: () => ({ properties: [extracted({ normalizedAddress: "1 Sukhumvit" })] }),
      },
    );
    await sweep.run();
    expect(spies.upserts[0]?.photos).toEqual(["conv/P/img/content"]);
  });

  it("does not attribute photos when a batch yields multiple properties (ambiguous)", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#PM"),
          claim: tracker("user#PM"),
          batch: [textMsg(100, "two places"), imageMsg(200, "conv/PM/img/content")],
        },
      ],
      {
        mediaBytes: { "conv/PM/img/content": Buffer.from("jpg") },
        extract: () => ({
          properties: [
            extracted({ normalizedAddress: "A" }),
            extracted({ normalizedAddress: "B" }),
          ],
        }),
      },
    );
    await sweep.run();
    expect(spies.upserts.every((u) => u.photos === undefined)).toBe(true);
  });

  it("feeds S3 media bytes to the extractor as base64", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#H"),
          claim: tracker("user#H"),
          batch: [imageMsg(200, "conv/user#H/img200/content.jpg")],
        },
      ],
      {
        mediaBytes: { "conv/user#H/img200/content.jpg": Buffer.from("PHOTO") },
        extract: () => ({ properties: [extracted({ projectName: "Chanote scan" })] }),
      },
    );
    await sweep.run();
    expect(spies.mediaReads).toEqual(["conv/user#H/img200/content.jpg"]);
    expect(spies.extractRequests[0]?.media).toEqual([
      { base64: Buffer.from("PHOTO").toString("base64"), mediaType: "image/jpeg" },
    ]);
  });

  it("skips unreadable media but still extracts (warn, no failure)", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#I"),
          claim: tracker("user#I"),
          batch: [textMsg(200, "a plot"), imageMsg(300, "gone.jpg")],
        },
      ],
      { extract: () => ({ properties: [extracted({ projectName: "Plot" })] }) },
    );
    const result = await sweep.run();
    expect(result).toMatchObject({ ingested: 1, properties: 1, failed: 0 });
    expect(spies.warns.length).toBeGreaterThanOrEqual(1);
    expect(spies.extractRequests[0]?.media).toEqual([]); // the missing image was dropped
  });

  it("does not release, upsert, or push when extraction throws", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#J"), claim: tracker("user#J"), batch }],
      {
        extract: () => {
          throw new Error("anthropic 529");
        },
      },
    );
    const result = await sweep.run();
    expect(result).toMatchObject({ failed: 1, ingested: 0 });
    expect(spies.releases).toHaveLength(0); // watermark must not advance
    expect(spies.upserts).toHaveLength(0);
    expect(spies.pushes).toHaveLength(0);
  });

  it("still releases when the confirmation push fails (best-effort)", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#K"), claim: tracker("user#K"), batch }],
      { pushThrows: true, extract: () => ({ properties: [extracted({ projectName: "X" })] }) },
    );
    const result = await sweep.run();
    expect(result).toMatchObject({ ingested: 1, properties: 1, failed: 0 });
    expect(spies.releases).toHaveLength(1); // released despite the push failure
    expect(spies.warns.some((w) => w.includes("push"))).toBe(true);
  });
});
