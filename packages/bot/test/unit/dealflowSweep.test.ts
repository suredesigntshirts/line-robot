import { beforeEach, describe, expect, it, vi } from "vitest";

// The DealflowSweep orchestrates two cross-package seams — `@line-robot/db` (the scans + once-guards)
// and `@line-robot/domain` (`matchVettedUsers`) — over the LINE gateway. We mock the db scans/guards so
// the test exercises the wiring + the once-guard / vetted-filter logic deterministically (the real
// Postgres round-trip is the db package's integration test); `matchVettedUsers` is the REAL pure fn.

const {
  listLapsedExclusivity,
  markReleasePromptSent,
  listQuickSaleUnpushed,
  markQuickSalePushed,
  listApprovedVettedUsers,
} = vi.hoisted(() => ({
  listLapsedExclusivity: vi.fn(),
  markReleasePromptSent: vi.fn(),
  listQuickSaleUnpushed: vi.fn(),
  markQuickSalePushed: vi.fn(),
  listApprovedVettedUsers: vi.fn(),
}));

vi.mock("@line-robot/db", () => ({
  listLapsedExclusivity,
  markReleasePromptSent,
  listQuickSaleUnpushed,
  markQuickSalePushed,
  listApprovedVettedUsers,
}));

import type { Db } from "@line-robot/db";
import { DealflowSweep } from "../../src/app/dealflowSweep.js";
import type { OutboundMessage } from "../../src/core/domain/message.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { Clock, Logger } from "../../src/core/ports/runtime.js";

function makeLogger(): Logger {
  return { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } as unknown as Logger;
}

function makeGateway(): LineGateway & {
  push: ReturnType<typeof vi.fn>;
  pushes: Array<{ to: string; messages: OutboundMessage[] }>;
} {
  const pushes: Array<{ to: string; messages: OutboundMessage[] }> = [];
  const push = vi.fn(async (to: string, messages: OutboundMessage[]) => {
    pushes.push({ to, messages });
  });
  return { push, pushes, reply: async () => {}, isPermanentError: () => false };
}

// A frozen clock — the sweep's `now` is deterministic (never Date.now()).
const NOW_MS = Date.parse("2026-06-15T00:00:00Z");
const clock: Clock = { now: () => NOW_MS };

const MINIAPP = "https://miniapp.line.me/123-abc";

function deps(over: { gateway?: LineGateway; miniappUrl?: string } = {}) {
  return {
    db: {} as Db,
    gateway: over.gateway ?? makeGateway(),
    logger: makeLogger(),
    clock,
    miniappUrl: "miniappUrl" in over ? over.miniappUrl : MINIAPP,
  };
}

function uriOf(msg: OutboundMessage): string | undefined {
  return (msg as unknown as { cards: Array<{ actions: Array<{ uri?: string }> }> }).cards[0]
    ?.actions[0]?.uri;
}

function postbackDataOf(msg: OutboundMessage): string[] {
  const actions =
    (msg as unknown as { cards: Array<{ actions: Array<{ data?: string }> }> }).cards[0]?.actions ??
    [];
  return actions.map((a) => a.data ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
  listLapsedExclusivity.mockResolvedValue([]);
  listQuickSaleUnpushed.mockResolvedValue([]);
  listApprovedVettedUsers.mockResolvedValue([]);
  markReleasePromptSent.mockResolvedValue(true);
  markQuickSalePushed.mockResolvedValue(true);
});

// ---------------------------------------------------------------------------
// Exclusivity-lapse release prompt.
// ---------------------------------------------------------------------------

describe("DealflowSweep — exclusivity-lapse release prompt", () => {
  const lapsedRow = {
    listingId: "L-lapsed",
    expiresAt: new Date("2026-06-10T00:00:00Z"), // before NOW → lapsed
    posterLineUserId: "Uposter",
    sourceGroupId: "G1",
    windowDays: 7,
    headline: "บ้านหมดเวลา",
  };

  it("DMs the poster ONCE on lapse, transitioning held→releasable (guard), with the 3 release postbacks", async () => {
    listLapsedExclusivity.mockResolvedValue([lapsedRow]);
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();

    // The once-guard was won → the DM was sent to the claimant's LINE id (a 1:1 DM).
    expect(markReleasePromptSent).toHaveBeenCalledWith({}, "L-lapsed");
    expect(gw.pushes).toHaveLength(1);
    expect(gw.pushes[0]?.to).toBe("Uposter");
    const msg = gw.pushes[0]?.messages[0] as OutboundMessage;
    expect(msg.type).toBe("flex");
    // The card carries all three decisions as postbacks (release-publicly / other-groups / extend).
    const datas = postbackDataOf(msg);
    expect(datas.some((d) => d.includes("releasepublicly") && d.includes("id=L-lapsed"))).toBe(
      true,
    );
    expect(datas.some((d) => d.includes("releasetoothergroups"))).toBe(true);
    expect(datas.some((d) => d.includes("extendexclusivity"))).toBe(true);
    expect(result.lapsed).toBe(1);
    expect(result.promptsSent).toBe(1);
  });

  it("a SECOND sweep sends NO DM (the held→releasable guard returns false)", async () => {
    listLapsedExclusivity.mockResolvedValue([lapsedRow]);
    markReleasePromptSent.mockResolvedValue(false); // already prompted on a prior sweep
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();
    expect(markReleasePromptSent).toHaveBeenCalledTimes(1);
    expect(gw.pushes).toHaveLength(0);
    expect(result.promptsSent).toBe(0);
  });

  it("a failed release-prompt push never throws out of the sweep (best-effort)", async () => {
    listLapsedExclusivity.mockResolvedValue([lapsedRow]);
    const gw = makeGateway();
    gw.push.mockRejectedValueOnce(new Error("LINE 500"));
    await expect(new DealflowSweep(deps({ gateway: gw })).run()).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Quick-quote Flex push.
// ---------------------------------------------------------------------------

describe("DealflowSweep — quick-quote Flex push", () => {
  const quickSale = {
    listingId: "L-quick",
    province: "เชียงใหม่",
    propertyType: "house" as const,
    dealType: "sale" as const,
    amountThb: 4_200_000, // band s2
    headline: "ขายด่วน",
  };
  // An approved broker matching CNX/house/s2, and an unmatched Phuket-only investor. `userId` is the
  // pg UUID (dedup/logging); `lineUserId` is the LINE provider subject — the ONLY valid push target
  // (pushing the pg UUID would 400 on LINE's pushMessage). They are deliberately distinct.
  const brokerMatch = {
    userId: "a1b2c3d4-0000-4000-8000-000000000001", // pg UUID — never the push target
    lineUserId: "Ubroker0000000000000000000000000",
    kind: "broker" as const,
    provinces: ["เชียงใหม่"],
    propertyTypes: ["house"],
    priceBandIds: ["s2"],
  };
  const investorNoMatch = {
    userId: "a1b2c3d4-0000-4000-8000-000000000002",
    lineUserId: "Uinvestor000000000000000000000000",
    kind: "investor" as const,
    provinces: ["ภูเก็ต"],
    propertyTypes: [],
    priceBandIds: [],
  };

  it("pushes the quote card ONLY to the matched vetted user, deep-linking /quote/{id}; guards once", async () => {
    listQuickSaleUnpushed.mockResolvedValue([quickSale]);
    listApprovedVettedUsers.mockResolvedValue([brokerMatch, investorNoMatch]);
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();

    // Exactly one recipient — the matched broker — never the unmatched investor. The push `to` MUST
    // be the broker's LINE provider subject (lineUserId), NOT the pg UUID (which would 400 on LINE).
    expect(gw.pushes).toHaveLength(1);
    expect(gw.pushes[0]?.to).toBe(brokerMatch.lineUserId);
    expect(gw.pushes[0]?.to).not.toBe(brokerMatch.userId); // never the pg UUID
    expect(uriOf(gw.pushes[0]?.messages[0] as OutboundMessage)).toBe(`${MINIAPP}/quote/L-quick`);
    // The once-guard was stamped with the deterministic clock.
    expect(markQuickSalePushed).toHaveBeenCalledWith({}, "L-quick", new Date(NOW_MS));
    expect(result.quotePushes).toBe(1);
    expect(result.quoteRecipients).toBe(1);
  });

  it("EXCLUDES an unvetted/unmatched user — a listing with no matched candidate is not pushed (no guard burn)", async () => {
    listQuickSaleUnpushed.mockResolvedValue([quickSale]);
    // Only the non-matching investor is vetted → no recipient → no push, no guard stamp.
    listApprovedVettedUsers.mockResolvedValue([investorNoMatch]);
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();
    expect(gw.pushes).toHaveLength(0);
    expect(markQuickSalePushed).not.toHaveBeenCalled(); // left un-pushed for a later sweep
    expect(result.quotePushes).toBe(0);
  });

  it("a SECOND sweep does NOT re-push (the quick_sale_pushed_at guard returns false)", async () => {
    listQuickSaleUnpushed.mockResolvedValue([quickSale]);
    listApprovedVettedUsers.mockResolvedValue([brokerMatch]);
    markQuickSalePushed.mockResolvedValue(false); // already pushed on a prior sweep
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();
    // The guard is consulted but, having lost it, NO push happens.
    expect(markQuickSalePushed).toHaveBeenCalledTimes(1);
    expect(gw.pushes).toHaveLength(0);
    expect(result.quotePushes).toBe(0);
  });

  it("skips a quick_sale listing with a non-positive amount without throwing (defence-in-depth)", async () => {
    listQuickSaleUnpushed.mockResolvedValue([{ ...quickSale, amountThb: 0 }]);
    listApprovedVettedUsers.mockResolvedValue([brokerMatch]);
    const gw = makeGateway();
    const result = await new DealflowSweep(deps({ gateway: gw })).run();
    expect(gw.pushes).toHaveLength(0);
    expect(markQuickSalePushed).not.toHaveBeenCalled();
    expect(result.quotePushes).toBe(0);
  });

  it("skips the quick-quote push entirely when no miniappUrl is configured (the /quote link can't resolve)", async () => {
    listQuickSaleUnpushed.mockResolvedValue([quickSale]);
    listApprovedVettedUsers.mockResolvedValue([brokerMatch]);
    const gw = makeGateway();
    await new DealflowSweep(deps({ gateway: gw, miniappUrl: undefined })).run();
    // The scan is never even consulted — no push, no guard.
    expect(listQuickSaleUnpushed).not.toHaveBeenCalled();
    expect(gw.pushes).toHaveLength(0);
  });
});
