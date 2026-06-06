import { describe, expect, it } from "vitest";
import { IngestionSweep } from "../../src/app/ingestionSweep.js";
import type { ConversationTracker } from "../../src/core/domain/catalog.js";
import type { StoredMessage } from "../../src/core/domain/message.js";
import type { CatalogRepository } from "../../src/core/ports/catalog.js";
import type { MessageRepository } from "../../src/core/ports/persistence.js";

interface ReleaseCall {
  key: string;
  watermark: number;
  claimSeenInboundAt: number;
}

interface Spies {
  findPending: { nowIso: string; limit: number }[];
  claims: { key: string; nowMs: number; staleTimeoutMs: number }[];
  findSince: { key: string; sinceMs: number }[];
  releases: ReleaseCall[];
  errors: string[];
}

/** A conversation script: how the fakes behave for one conversationKey. */
interface ConvScript {
  tracker: ConversationTracker;
  /** Result of claimConversation: `null` simulates a contended/lost claim. */
  claim: ConversationTracker | null;
  /** Messages findSince returns (or an Error to throw). */
  batch: StoredMessage[] | Error;
}

function tracker(key: string, over: Partial<ConversationTracker> = {}): ConversationTracker {
  return {
    conversationKey: key,
    lastInboundAt: 500,
    lastIngestedAt: 100,
    status: "IDLE",
    ...over,
  };
}

function msg(timestamp: number): StoredMessage {
  return {
    ref: { kind: "user", userId: "U" },
    messageId: `m${timestamp}`,
    direction: "in",
    contentType: "text",
    text: "hi",
    timestamp,
  };
}

function makeSweep(scripts: ConvScript[], nowMs = 10_000) {
  const spies: Spies = { findPending: [], claims: [], findSince: [], releases: [], errors: [] };
  const byKey = new Map(scripts.map((s) => [s.tracker.conversationKey, s]));

  const catalog: Partial<CatalogRepository> = {
    findPendingConversations: async (nowIso, limit) => {
      spies.findPending.push({ nowIso, limit });
      return scripts.map((s) => s.tracker);
    },
    claimConversation: async (key, claimNowMs, staleTimeoutMs) => {
      spies.claims.push({ key, nowMs: claimNowMs, staleTimeoutMs });
      return byKey.get(key)?.claim ?? null;
    },
    releaseConversation: async (key, opts) => {
      spies.releases.push({ key, ...opts });
    },
  };
  const messages: Partial<MessageRepository> = {
    findSince: async (key, sinceMs) => {
      spies.findSince.push({ key, sinceMs });
      const batch = byKey.get(key)?.batch ?? [];
      if (batch instanceof Error) {
        throw batch;
      }
      return batch;
    },
  };
  const sweep = new IngestionSweep(
    {
      catalog: catalog as CatalogRepository,
      messages: messages as MessageRepository,
      logger: {
        info: () => {},
        warn: () => {},
        error: (m) => {
          spies.errors.push(m);
        },
      },
      clock: { now: () => nowMs },
    },
    { maxConversations: 10, staleTimeoutMs: 1000 },
  );
  return { sweep, spies };
}

describe("IngestionSweep", () => {
  it("does nothing when no conversations are due", async () => {
    const { sweep, spies } = makeSweep([]);
    const result = await sweep.run();

    expect(result).toEqual({ due: 0, claimed: 0, ingested: 0, messages: 0, skipped: 0, failed: 0 });
    expect(spies.claims).toHaveLength(0);
    // The GSI query is bounded by the configured maxConversations and uses the clock's ISO time.
    expect(spies.findPending).toEqual([{ nowIso: new Date(10_000).toISOString(), limit: 10 }]);
  });

  it("claims, batches, and releases a due conversation (watermark = newest message)", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#A"),
        claim: tracker("user#A", { status: "INGESTING", lastInboundAt: 500, lastIngestedAt: 100 }),
        batch: [msg(200), msg(300), msg(500)],
      },
    ]);
    const result = await sweep.run();

    expect(result).toMatchObject({ due: 1, claimed: 1, ingested: 1, messages: 3, skipped: 0 });
    expect(spies.claims).toEqual([{ key: "user#A", nowMs: 10_000, staleTimeoutMs: 1000 }]);
    expect(spies.findSince).toEqual([{ key: "user#A", sinceMs: 100 }]);
    // Watermark is the newest batched message; claimSeenInboundAt is the inbound seen at claim time.
    expect(spies.releases).toEqual([{ key: "user#A", watermark: 500, claimSeenInboundAt: 500 }]);
  });

  it("skips a conversation whose claim is contended (no batch, no release)", async () => {
    const { sweep, spies } = makeSweep([
      { tracker: tracker("user#B"), claim: null, batch: [msg(200)] },
    ]);
    const result = await sweep.run();

    expect(result).toMatchObject({ due: 1, claimed: 0, ingested: 0, messages: 0, skipped: 1 });
    expect(spies.findSince).toHaveLength(0);
    expect(spies.releases).toHaveLength(0);
  });

  it("releases with the existing watermark when the batch is empty", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#C"),
        claim: tracker("user#C", { lastInboundAt: 700, lastIngestedAt: 400 }),
        batch: [],
      },
    ]);
    const result = await sweep.run();

    expect(result).toMatchObject({ ingested: 1, messages: 0 });
    // No new messages → watermark stays at lastIngestedAt; release still clears the claim.
    expect(spies.releases).toEqual([{ key: "user#C", watermark: 400, claimSeenInboundAt: 700 }]);
  });

  it("records a failure and leaves the claim when batching throws", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#D"),
        claim: tracker("user#D", { status: "INGESTING" }),
        batch: new Error("dynamo down"),
      },
    ]);
    const result = await sweep.run();

    expect(result).toMatchObject({ claimed: 0, ingested: 0, failed: 1 });
    // The claim is intentionally not released — the stale-timeout retries the whole batch.
    expect(spies.releases).toHaveLength(0);
    expect(spies.errors).toHaveLength(1);
  });

  it("processes multiple conversations, isolating a contended one", async () => {
    const { sweep, spies } = makeSweep([
      {
        tracker: tracker("user#E"),
        claim: tracker("user#E", { lastInboundAt: 500, lastIngestedAt: 0 }),
        batch: [msg(100), msg(500)],
      },
      { tracker: tracker("user#F"), claim: null, batch: [msg(900)] },
      {
        tracker: tracker("user#G"),
        claim: tracker("user#G", { lastInboundAt: 800, lastIngestedAt: 800 }),
        batch: [],
      },
    ]);
    const result = await sweep.run();

    expect(result).toEqual({ due: 3, claimed: 2, ingested: 2, messages: 2, skipped: 1, failed: 0 });
    expect(spies.releases.map((r) => r.key)).toEqual(["user#E", "user#G"]);
  });
});
