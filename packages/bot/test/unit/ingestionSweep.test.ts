import { describe, expect, it } from "vitest";
import { IngestionSweep } from "../../src/app/ingestionSweep.js";
import type { PipelineV2Port } from "../../src/app/pipelineV2Sweep.js";
import type { ConversationTracker } from "../../src/core/domain/catalog.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import type { AppliedProperty } from "../../src/core/handlers/views.js";
import type { ConversationStore } from "../../src/core/ports/catalog.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { MessageRepository } from "../../src/core/ports/persistence.js";
import { textOf } from "../fixtures/outbound.js";

interface Spies {
  claims: { key: string; nowMs: number; staleTimeoutMs: number }[];
  releases: { key: string; watermark: number; claimSeenInboundAt: number }[];
  fails: string[];
  v2Calls: { key: string; batchSize: number }[];
  pushes: { to: string; messages: OutboundMessage[] }[];
  errors: string[];
  warns: string[];
}

interface ConvScript {
  tracker: ConversationTracker;
  claim: ConversationTracker | null;
  batch: StoredMessage[] | Error;
}

interface Options {
  /** What the v2 pipeline returns for a batch (the applied listings). Default: [] (no properties). */
  applied?: (key: string, batch: StoredMessage[]) => AppliedProperty[];
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

function makeSweep(scripts: ConvScript[], opts: Options = {}, nowMs = 10_000) {
  const spies: Spies = {
    claims: [],
    releases: [],
    fails: [],
    v2Calls: [],
    pushes: [],
    errors: [],
    warns: [],
  };
  const byKey = new Map(scripts.map((s) => [s.tracker.conversationKey, s]));

  // The sweep touches only the ConversationStore (tracker claim/debounce/watermark) — the property
  // catalog lives in Postgres, owned by the v2 pipeline (the `v2` port below).
  const catalog: Partial<ConversationStore> = {
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
  const v2: PipelineV2Port = {
    run: async (key, batch) => {
      spies.v2Calls.push({ key, batchSize: batch.length });
      return (opts.applied ?? (() => []))(key, batch);
    },
  };
  const sweep = new IngestionSweep(
    {
      catalog: catalog as ConversationStore,
      messages: messages as MessageRepository,
      v2,
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
    // the sweep gives up WITHOUT running the pipeline — marks FAILED + notifies the user once.
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
    expect(spies.v2Calls).toHaveLength(0); // critical: no inference spent
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
      { applied: () => [{ propertyId: "p1", isNew: true, ambiguous: false, label: "House" }] },
    );
    // 3 == cap (DEFAULT_MAX_INGEST_ATTEMPTS) → still allowed; only > cap abandons.
    const result = await sweep.run();
    expect(result).toMatchObject({ abandoned: 0, ingested: 1, properties: 1 });
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
    expect(spies.pushes).toHaveLength(0); // nothing applied → no confirmation pushed
  });

  it("records a failure and leaves the claim when batching throws", async () => {
    const { sweep, spies } = makeSweep([
      { tracker: tracker("user#D"), claim: tracker("user#D"), batch: new Error("dynamo down") },
    ]);
    expect(await sweep.run()).toMatchObject({ failed: 1, ingested: 0 });
    expect(spies.releases).toHaveLength(0);
    expect(spies.errors).toHaveLength(1);
  });

  it("still releases when the confirmation push fails (best-effort)", async () => {
    const { sweep, spies } = makeSweep(
      [{ tracker: tracker("user#P"), claim: tracker("user#P"), batch: [textMsg(200, "a house")] }],
      {
        applied: () => [{ propertyId: "p1", isNew: true, ambiguous: false, label: "House" }],
        pushThrows: true,
      },
    );
    expect(await sweep.run()).toMatchObject({ ingested: 1 });
    expect(spies.releases).toHaveLength(1); // released despite the failed push
    expect(spies.warns).toHaveLength(1); // push failure logged
  });
});

describe("IngestionSweep — v2 pipeline delegation", () => {
  it("routes extract-and-apply to the v2 port; claim/release/push machinery intact", async () => {
    const { sweep, spies } = makeSweep(
      [
        {
          tracker: tracker("group#G1"),
          claim: tracker("group#G1", { lastInboundAt: 500, lastIngestedAt: 100 }),
          batch: [textMsg(200, "ขายบ้าน 4.5 ล้าน")],
        },
      ],
      {
        applied: () => [
          { propertyId: "pg-uuid-1", isNew: true, ambiguous: false, label: "บ้านทดสอบ" },
        ],
      },
    );

    const result = await sweep.run();
    expect(spies.v2Calls).toEqual([{ key: "group#G1", batchSize: 1 }]);
    // Claim/release (watermark machinery) intact; confirmation pushed with the v2 label.
    expect(spies.claims).toHaveLength(1);
    expect(spies.releases).toEqual([{ key: "group#G1", watermark: 200, claimSeenInboundAt: 500 }]);
    expect(spies.pushes.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(spies.pushes[0])).toContain("บ้านทดสอบ");
    expect(result).toMatchObject({ ingested: 1, properties: 1 });
  });
});
