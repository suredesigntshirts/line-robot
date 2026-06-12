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
  ExtractionMedia,
  ExtractionRequest,
  ExtractionResult,
  ImageClassification,
  ImageClassifier,
  PropertySegmenter,
  SegmentationResult,
} from "../../src/core/ports/extraction.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { MediaReader } from "../../src/core/ports/mediaReader.js";
import type { MessageRepository } from "../../src/core/ports/persistence.js";
import { textOf } from "../fixtures/outbound.js";

interface Spies {
  claims: { key: string; nowMs: number; staleTimeoutMs: number }[];
  releases: { key: string; watermark: number; claimSeenInboundAt: number }[];
  fails: string[];
  segmentRequests: ExtractionRequest[];
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
  /** PIPELINE_V2 port — when set, extract-and-apply is delegated wholesale. */
  v2?: import("../../src/app/pipelineV2Sweep.js").PipelineV2Port;
  /** Per-conversation extraction behavior; returns the result or throws. Default: null (no props). */
  extract?: (req: ExtractionRequest) => ExtractionResult | null;
  /** Existing properties keyed by id (for dedup candidate loading). */
  properties?: Record<string, Property>;
  /** conversationKey → property ids (the Conv→Property edges). */
  convProperties?: Record<string, string[]>;
  /** s3Key → bytes; a missing key throws (simulating a vanished object). */
  mediaBytes?: Record<string, Buffer>;
  /** Per-image classification; default classifies every image as a plain property photo. */
  classify?: (media: ExtractionMedia) => ImageClassification | null;
  /** Full async classifier override (for exercising concurrency); takes precedence over `classify`. */
  classifyImpl?: ImageClassifier["classifyImage"];
  /** Pass-1 segmentation; default returns null → the sweep uses the single-pass fallback. */
  segment?: (req: ExtractionRequest) => SegmentationResult | null;
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
    existingPropertyId: "", // "" → create-new
    ambiguous: false,
    ambiguousWith: [],
    normalizedAddress: "",
    rawAddress: "",
    projectName: "",
    lat: null,
    long: null,
    district: "",
    subdistrict: "",
    province: "",
    propertyType: "",
    status: "",
    askingPrice: null,
    currency: "",
    tags: [],
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
    ...over,
  };
}

function makeSweep(scripts: ConvScript[], opts: Options = {}, nowMs = 10_000) {
  const spies: Spies = {
    claims: [],
    releases: [],
    fails: [],
    segmentRequests: [],
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
    failConversation: async (key) => {
      spies.fails.push(key);
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
  const classifier: ImageClassifier = {
    classifyImage:
      opts.classifyImpl ?? (async (m) => (opts.classify ?? (() => ({ kind: "property" })))(m)),
  };
  const segmenter: PropertySegmenter = {
    segment: async (req) => {
      spies.segmentRequests.push(req);
      return (opts.segment ?? (() => null))(req);
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
      segmenter,
      classifier,
      media,
      gateway: {
        reply: async () => {},
        push: async (to, msgs) => {
          if (opts.pushThrows) {
            throw new Error("push failed");
          }
          spies.pushes.push({ to, messages: msgs });
        },
        isPermanentError: () => false,
      } as LineGateway,
      logger: {
        info: () => {},
        warn: (m) => spies.warns.push(m),
        error: (m) => spies.errors.push(m),
      },
      clock: { now: () => nowMs },
      v2: opts.v2,
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
    expect(result).toMatchObject({ due: 0, ingested: 0, properties: 0 });
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

  it("abandons a conversation once the attempt cap is exceeded (no extraction, marks FAILED)", async () => {
    // Cost guard: a batch that keeps failing must not loop forever burning inference. After the cap,
    // the sweep gives up WITHOUT extracting — marks FAILED + notifies the user once.
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#X"),
        claim: tracker("user#X", { status: "INGESTING", ingestAttempts: 4 }),
        batch: [textMsg(200, "this batch keeps failing")],
      },
    ]);
    const result = await sweep.run();
    expect(result).toMatchObject({ abandoned: 1, ingested: 0, skipped: 0, failed: 0 });
    expect(spies.fails).toEqual(["user#X"]); // marked FAILED (dropped off the pending index)
    expect(spies.extractRequests).toHaveLength(0); // critical: no inference spent
    expect(spies.releases).toHaveLength(0); // not released — it's terminal
    expect(spies.pushes).toHaveLength(1); // user told once
    expect(textOf(spies.pushes[0]?.messages[0])).toMatch(/couldn't process/i);
  });

  it("still ingests on the final allowed attempt (at the cap, not over it)", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#Y"),
          claim: tracker("user#Y", { status: "INGESTING", ingestAttempts: 3 }),
          batch: [textMsg(200, "a house")],
        },
      ],
      { extract: () => ({ properties: [extracted({ projectName: "House" })] }) },
    );
    // 3 == cap (DEFAULT_MAX_INGEST_ATTEMPTS) → still allowed; only > cap abandons.
    const result = await sweep.run();
    expect(result).toMatchObject({ abandoned: 0, ingested: 1 });
    expect(spies.fails).toHaveLength(0);
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

  it("two-pass: segments a multi-property batch and attributes each one's own photo + map", async () => {
    const focusSeen: string[] = [];
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("group#G"),
          claim: tracker("group#G"),
          batch: [
            textMsg(1000, "Baan Lak Chai 3 bed https://www.google.com/maps?q=18.8,99.0"),
            imageMsg(2000, "deed.jpg"),
            textMsg(40000, "Mooban Wangtan 2.3M https://www.google.com/maps?q=18.7,98.9"),
            imageMsg(41000, "house.jpg"),
          ],
        },
      ],
      {
        mediaBytes: { "deed.jpg": Buffer.from("DEED"), "house.jpg": Buffer.from("HOUSE") },
        classify: (m) =>
          Buffer.from(m.base64, "base64").toString() === "DEED"
            ? { kind: "chanote", chanote: { deedNumber: "111" } }
            : { kind: "property", label: "external - front" },
        segment: () => ({
          segments: [
            {
              label: "Baan Lak Chai",
              existingPropertyId: "",
              ambiguous: false,
              ambiguousWith: [],
              imageIndices: [0],
              mapIndex: 0,
            },
            {
              label: "Mooban Wangtan",
              existingPropertyId: "",
              ambiguous: false,
              ambiguousWith: [],
              imageIndices: [1],
              mapIndex: 1,
            },
          ],
          memoryUpdate: "",
        }),
        extract: (req) => {
          focusSeen.push(req.focus ?? "");
          return req.focus === "Baan Lak Chai"
            ? { properties: [extracted({ normalizedAddress: "Baan Lak Chai", bedrooms: 3 })] }
            : {
                properties: [extracted({ projectName: "Mooban Wangtan", askingPrice: 1_700_000 })],
              };
        },
      },
    );
    await sweep.run();

    // The segmenter saw a timestamped transcript with indexed image + map markers.
    const transcript = spies.segmentRequests[0]?.text ?? "";
    expect(transcript).toContain("[IMG 0] chanote");
    expect(transcript).toContain("[IMG 1] property - external - front");
    expect(transcript).toContain("[MAP 0]");
    expect(transcript).toMatch(/\[\d+ \w+ \d{2}:\d{2}:\d{2}\]/); // per-line second-resolution stamp

    // Each property got its OWN photo + map (the old code attributed nothing on multi-property).
    expect(focusSeen).toEqual(["Baan Lak Chai", "Mooban Wangtan"]);
    const lak = spies.upserts.find((u) => u.normalizedAddress === "Baan Lak Chai");
    const moo = spies.upserts.find((u) => u.projectName === "Mooban Wangtan");
    expect(lak?.photos).toEqual([{ s3Key: "deed.jpg", kind: "chanote" }]);
    expect(lak?.chanote).toEqual({ deedNumber: "111" });
    expect(lak?.mapUrl).toBe("https://www.google.com/maps?q=18.8,99.0");
    expect(moo?.photos).toEqual([
      { s3Key: "house.jpg", kind: "property", label: "external - front" },
    ]);
    expect(moo?.mapUrl).toBe("https://www.google.com/maps?q=18.7,98.9");
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
    expect(spies.upserts[0]?.photos).toEqual([{ s3Key: "conv/P/img/content", kind: "property" }]);
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

  it("feeds S3 media bytes to the per-image classifier as base64 (not the text extractor)", async () => {
    const seen: ExtractionMedia[] = [];
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
        classify: (m) => {
          seen.push(m);
          return { kind: "property" };
        },
        extract: () => ({ properties: [extracted({ projectName: "House" })] }),
      },
    );
    await sweep.run();
    expect(spies.mediaReads).toEqual(["conv/user#H/img200/content.jpg"]);
    expect(seen).toEqual([
      { base64: Buffer.from("PHOTO").toString("base64"), mediaType: "image/jpeg" },
    ]);
    // Images are handled per-image now — the property extractor gets text only.
    expect(spies.extractRequests[0]?.media).toEqual([]);
  });

  it("classifies images with bounded concurrency (not one-at-a-time, not all-at-once)", async () => {
    // Regression guard: a serial classify loop over a big photo batch blew the sweep's Lambda
    // timeout in prod (23 images × one vision call each > 60s). Classification must fan out.
    const COUNT = 8;
    let inFlight = 0;
    let peak = 0;
    const batch = Array.from({ length: COUNT }, (_, i) => imageMsg(100 + i, `img${i}.jpg`));
    const mediaBytes = Object.fromEntries(
      batch.map((_, i) => [`img${i}.jpg`, Buffer.from(`b${i}`)]),
    );
    const { sweep } = makeSweep([{ tracker: tracker("user#P"), claim: tracker("user#P"), batch }], {
      mediaBytes,
      classifyImpl: async () => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        // Yield twice so every concurrently-started call is observed before any resolves.
        await Promise.resolve();
        await Promise.resolve();
        inFlight -= 1;
        return { kind: "property" };
      },
    });
    await sweep.run();
    expect(peak).toBeGreaterThan(1); // not serial
    expect(peak).toBeLessThan(COUNT); // not unbounded (the pool caps in-flight below the batch size)
  });

  it("stores chanote data + labels the photo, and OCRs 'other' docs into the extractor text", async () => {
    let extractText = "";
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("user#C"),
          claim: tracker("user#C"),
          batch: [
            textMsg(100, "land for sale"),
            imageMsg(200, "deed.jpg"),
            imageMsg(210, "screenshot.jpg"),
          ],
        },
      ],
      {
        mediaBytes: {
          "deed.jpg": Buffer.from("DEED"),
          "screenshot.jpg": Buffer.from("SHOT"),
        },
        classify: (m) => {
          const text = Buffer.from(m.base64, "base64").toString();
          if (text === "DEED") {
            return { kind: "chanote", chanote: { deedNumber: "1234", titleType: "chanote" } };
          }
          return { kind: "other", ocrText: "owner asks 6.5M, call 081-000" };
        },
        extract: (req) => {
          extractText = req.text;
          return { properties: [extracted({ normalizedAddress: "1 Rai Plot" })] };
        },
      },
    );
    await sweep.run();
    const upsert = spies.upserts[0];
    expect(upsert?.chanote).toEqual({ deedNumber: "1234", titleType: "chanote" });
    expect(upsert?.photos).toEqual([
      { s3Key: "deed.jpg", kind: "chanote" },
      { s3Key: "screenshot.jpg", kind: "other" },
    ]);
    // The screenshot's OCR text is appended to the chat text the extractor reads.
    expect(extractText).toContain("owner asks 6.5M");
  });

  it("skips unreadable media but still extracts (warn, no photo)", async () => {
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
    expect(spies.upserts[0]?.photos).toBeUndefined(); // the missing image yielded no photo
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

  it("two-pass: forwards the stored memory note to each pass-2 focused extract", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("group#MM"),
          claim: tracker("group#MM"),
          batch: [textMsg(1000, "Baan Lak Chai 3 bed"), textMsg(40000, "Mooban Wangtan 2.3M")],
        },
      ],
      {
        memory: { "group#MM": "'the plot' = Baan Lak Chai. Khun Mali is the seller." },
        segment: () => ({
          segments: [
            {
              label: "Baan Lak Chai",
              existingPropertyId: "",
              ambiguous: false,
              ambiguousWith: [],
              imageIndices: [],
              mapIndex: -1,
            },
            {
              label: "Mooban Wangtan",
              existingPropertyId: "",
              ambiguous: false,
              ambiguousWith: [],
              imageIndices: [],
              mapIndex: -1,
            },
          ],
          memoryUpdate: "",
        }),
        extract: (req) =>
          req.focus === "Baan Lak Chai"
            ? { properties: [extracted({ normalizedAddress: "Baan Lak Chai" })] }
            : { properties: [extracted({ projectName: "Mooban Wangtan" })] },
      },
    );
    await sweep.run();

    // Pass 1 (segment) AND both pass-2 focused extracts must carry the stored memory note.
    expect(spies.segmentRequests[0]?.memory).toBe(
      "'the plot' = Baan Lak Chai. Khun Mali is the seller.",
    );
    expect(spies.extractRequests).toHaveLength(2);
    expect(spies.extractRequests[0]?.memory).toBe(
      "'the plot' = Baan Lak Chai. Khun Mali is the seller.",
    );
    expect(spies.extractRequests[1]?.memory).toBe(
      "'the plot' = Baan Lak Chai. Khun Mali is the seller.",
    );
    // And focus is still per-segment (we didn't break the two-pass attribution).
    expect(spies.extractRequests.map((r) => r.focus)).toEqual(["Baan Lak Chai", "Mooban Wangtan"]);
  });
});

describe("PIPELINE_V2 delegation (stage-2 increment 9)", () => {
  it("routes extract-and-apply to the v2 port; claim/release/push machinery unchanged", async () => {
    const v2Calls: Array<{ key: string; batchSize: number }> = [];
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("group#G1"),
          claim: tracker("group#G1", { lastInboundAt: 500, lastIngestedAt: 100 }),
          batch: [textMsg(200, "ขายบ้าน 4.5 ล้าน")],
        },
      ],
      {
        v2: {
          run: async (key, batch) => {
            v2Calls.push({ key, batchSize: batch.length });
            return [{ propertyId: "pg-uuid-1", isNew: true, ambiguous: false, label: "บ้านทดสอบ" }];
          },
        },
      },
    );

    const result = await sweep.run();
    expect(v2Calls).toEqual([{ key: "group#G1", batchSize: 1 }]);
    // v1 segmenter/extractor were never consulted.
    expect(spies.segmentRequests).toHaveLength(0);
    expect(spies.extractRequests).toHaveLength(0);
    // Claim/release (watermark machinery) intact; confirmation pushed with the v2 label.
    expect(spies.claims).toHaveLength(1);
    expect(spies.releases).toEqual([{ key: "group#G1", watermark: 200, claimSeenInboundAt: 500 }]);
    expect(spies.pushes.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(spies.pushes[0])).toContain("บ้านทดสอบ");
    expect(result).toMatchObject({ ingested: 1, properties: 1 });
  });
});
