import { beforeEach, describe, expect, it, vi } from "vitest";

// `createPipelineV2Port` is now the SOLE extraction path (the v1 claudeExtractor was deleted in A3),
// so its orchestration and the transcript it builds for the segmenter need direct coverage (the A3
// deferral folded into the Stage 2 gate). We mock the two cross-package seams it calls directly —
// `@line-robot/pipeline` (derivative build + the 6-step run) and `@line-robot/db` (owner lookup) —
// so the test exercises the wiring without standing up Postgres or sharp. The real pipeline +
// Postgres round-trip is covered by the pipeline package's integration test.

// vi.mock factories are hoisted above top-level declarations, so the mock fns must be created via
// vi.hoisted() (which is hoisted with them) rather than as plain consts.
const {
  runPipeline,
  buildDerivatives,
  findOrCreateUserByIdentity,
  findOrCreateGroupByLineGroupId,
  upsertMembership,
  markClaimInvited,
} = vi.hoisted(() => ({
  runPipeline: vi.fn(),
  buildDerivatives: vi.fn(),
  findOrCreateUserByIdentity: vi.fn(),
  findOrCreateGroupByLineGroupId: vi.fn(),
  upsertMembership: vi.fn(),
  markClaimInvited: vi.fn(),
}));

vi.mock("@line-robot/pipeline", () => ({
  runPipeline,
  buildDerivatives,
  // A minimal CostLog stand-in: the port only reads totalUsd()/sawCacheHit() for its log line.
  CostLog: class {
    totalUsd() {
      return 0;
    }
    sawCacheHit() {
      return false;
    }
  },
}));

vi.mock("@line-robot/db", () => ({
  findOrCreateUserByIdentity,
  findOrCreateGroupByLineGroupId,
  upsertMembership,
  markClaimInvited,
}));

import type { Db } from "@line-robot/db";
import type { MediaStore, StepLlm } from "@line-robot/pipeline";
import {
  buildTranscript,
  type ClassifiedMedia,
  createPipelineV2Port,
} from "../../src/app/pipelineV2Sweep.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { Logger } from "../../src/core/ports/runtime.js";

// ---------------------------------------------------------------------------
// buildTranscript — the timestamped transcript + [IMG n]/[MAP n] markers the segmenter reads.
// ---------------------------------------------------------------------------

function textMsg(timestamp: number, text: string): StoredMessage {
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
    messageId: `m${timestamp}`,
    direction: "in",
    contentType: "image",
    attachment: { s3Key, contentType: "image/jpeg" },
    timestamp,
  };
}

/** A group message carrying a real sender id — the shape the live ingest path sees (the membership +
 * claim-DM population in Build C reads `ref.senderUserId`, not the conversation pseudo-user). */
function groupTextMsg(timestamp: number, text: string, senderUserId = "Usender"): StoredMessage {
  return {
    ref: { kind: "group", groupId: "Cgrp1", senderUserId },
    messageId: `m${timestamp}`,
    direction: "in",
    contentType: "text",
    text,
    timestamp,
  };
}

function marker(s3Key: string, over: Partial<ClassifiedMedia> = {}): ClassifiedMedia {
  return { s3Key, contentType: "image/jpeg", kind: "property", ...over };
}

describe("buildTranscript", () => {
  it("emits one timestamped line per text message in chronological order", () => {
    const { transcript } = buildTranscript(
      // Deliberately out of order — the builder sorts by timestamp.
      [textMsg(2000, "second"), textMsg(1000, "first")],
      [],
    );
    const lines = transcript.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/ first$/);
    expect(lines[1]).toMatch(/ second$/);
    // Each line is prefixed with a [<Bangkok date+time>] stamp.
    expect(lines[0]).toMatch(/^\[\d+ \w+ \d{2}:\d{2}:\d{2}\] first$/);
  });

  it("renders an image attachment as an indexed [IMG n] marker with kind/label/ocr", () => {
    const { transcript } = buildTranscript(
      [imageMsg(1000, "k0"), imageMsg(2000, "k1")],
      [
        marker("k0", { kind: "chanote", label: "deed - front", ocrText: "เลขที่ 1234" }),
        marker("k1"),
      ],
    );
    const lines = transcript.split("\n");
    expect(lines[0]).toContain("[IMG 0] chanote - deed - front ocr: เลขที่ 1234");
    expect(lines[1]).toContain("[IMG 1] property");
    // No label/ocr on the bare marker — neither suffix is emitted.
    expect(lines[1]).not.toContain(" - ");
    expect(lines[1]).not.toContain("ocr:");
  });

  it("indexes [IMG n] by the classified array position, not message order", () => {
    // Image whose key is classified[1] arrives FIRST in time; its marker must still be [IMG 1].
    const { transcript } = buildTranscript(
      [imageMsg(1000, "second-in-list"), imageMsg(2000, "first-in-list")],
      [marker("first-in-list"), marker("second-in-list")],
    );
    const lines = transcript.split("\n");
    expect(lines[0]).toContain("[IMG 1]"); // earlier timestamp, but second in the classified array
    expect(lines[1]).toContain("[IMG 0]");
  });

  it("rewrites map URLs to [MAP n] and de-duplicates the same URL to one index", () => {
    const url = "https://maps.google.com/maps?q=18.79,98.98";
    const { transcript, mapLinks } = buildTranscript(
      [textMsg(1000, `here ${url} ok`), textMsg(2000, `again ${url}`)],
      [],
    );
    expect(mapLinks).toEqual([url]);
    const lines = transcript.split("\n");
    expect(lines[0]).toContain("here [MAP 0] ok");
    expect(lines[1]).toContain("again [MAP 0]");
  });

  it("emits coordByMapIndex aligned with [MAP n] — coords for pins, null for short links (A1)", () => {
    const pin = "https://www.google.com/maps?q=18.72989755,98.96882414"; // [MAP 0] — coordinate pin
    const short = "https://maps.app.goo.gl/zZ9wMT4nqYnVsEcZA"; // [MAP 1] — no coordinates
    const { mapLinks, coordByMapIndex } = buildTranscript(
      [textMsg(1000, `house ${pin}`), textMsg(2000, `townhome ${short}`)],
      [],
    );
    expect(mapLinks).toEqual([pin, short]);
    // The short link (the index-misalignment trigger) maps to null, NOT to the pin's coordinate.
    expect(coordByMapIndex).toEqual(["18.72989755,98.96882414", null]);
  });

  it("skips empty-text and attachment-less messages, and an image with no classification", () => {
    const { transcript } = buildTranscript(
      [
        textMsg(1000, ""), // empty text → skipped
        imageMsg(2000, "unclassified"), // no marker for this key → skipped
        textMsg(3000, "real"),
      ],
      [], // no classifications at all
    );
    expect(transcript).toMatch(/^\[\d+ \w+ \d{2}:\d{2}:\d{2}\] real$/);
    expect(transcript.split("\n")).toHaveLength(1);
  });

  it("returns an empty transcript for an empty batch", () => {
    expect(buildTranscript([], [])).toEqual({ transcript: "", mapLinks: [], coordByMapIndex: [] });
  });
});

// ---------------------------------------------------------------------------
// createPipelineV2Port.run — orchestration over the mocked seams.
// ---------------------------------------------------------------------------

function makeLogger(): Logger & {
  infos: unknown[];
  warns: unknown[];
} {
  const infos: unknown[] = [];
  const warns: unknown[] = [];
  return {
    infos,
    warns,
    info: (msg: string, meta?: unknown) => infos.push({ msg, meta }),
    warn: (msg: string, meta?: unknown) => warns.push({ msg, meta }),
    error: () => {},
    debug: () => {},
  } as unknown as Logger & { infos: unknown[]; warns: unknown[] };
}

/** A fake LINE gateway recording every push (the claim DM). Implements the full LineGateway port; the
 * port only calls `push`, so reply/isPermanentError are inert stubs. */
function makeGateway(): LineGateway & {
  push: ReturnType<typeof vi.fn>;
  pushes: Array<{ to: string; messages: OutboundMessage[] }>;
} {
  const pushes: Array<{ to: string; messages: OutboundMessage[] }> = [];
  const push = vi.fn(async (to: string, messages: OutboundMessage[]) => {
    pushes.push({ to, messages });
  });
  return {
    push,
    pushes,
    reply: async () => {},
    isPermanentError: () => false,
  };
}

const deps = (over: { gateway?: LineGateway; miniappUrl?: string } = {}) => ({
  db: {} as Db,
  llm: {} as StepLlm,
  media: {} as MediaStore,
  logger: makeLogger(),
  ...over,
});

describe("createPipelineV2Port.run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default owner/user resolution: the shared race-safe find-or-create returns a stable pg user.
    findOrCreateUserByIdentity.mockResolvedValue({ id: "owner-1" });
    // Build C population defaults: group upsert returns a stable id; membership + guard succeed.
    findOrCreateGroupByLineGroupId.mockResolvedValue({ id: "grp-pg-1", lineGroupId: "Cgrp1" });
    upsertMembership.mockResolvedValue(undefined);
    markClaimInvited.mockResolvedValue(true); // first invite (overridden per-test)
  });

  it("short-circuits an empty batch without calling the pipeline", async () => {
    const d = deps();
    const out = await createPipelineV2Port(d).run("conv#1", []);
    expect(out).toEqual([]);
    expect(runPipeline).not.toHaveBeenCalled();
    // Empty transcript → the "nothing to extract" branch, owner never resolved.
    expect(findOrCreateUserByIdentity).not.toHaveBeenCalled();
  });

  it("maps pipeline listings to AppliedProperty (isNew from the dedup decision)", async () => {
    runPipeline.mockResolvedValue({
      listings: [
        { listingId: "L-new", title: "Condo near Nimman", decision: { decision: "new" }, gate: {} },
        { listingId: "L-merged-0123456789", title: "", decision: { decision: "merge" }, gate: {} },
      ],
      droppedSegments: [],
    });
    const d = deps();
    const out = await createPipelineV2Port(d).run("conv#1", [textMsg(1000, "house for sale")]);

    expect(runPipeline).toHaveBeenCalledTimes(1);
    expect(out).toEqual([
      { propertyId: "L-new", isNew: true, ambiguous: false, label: "Condo near Nimman" },
      // Empty title falls back to the first 8 chars of the id.
      { propertyId: "L-merged-0123456789", isNew: false, ambiguous: false, label: "L-merged" },
    ]);
  });

  it("threads the owner id from find-or-create-user into the pipeline input", async () => {
    // The conversation pseudo-owner is resolved via the shared race-safe find-or-create (the create
    // path itself is covered by the db integration test); the port just threads the returned id.
    findOrCreateUserByIdentity.mockResolvedValue({ id: "owner-fresh" });
    runPipeline.mockResolvedValue({ listings: [], droppedSegments: [] });
    const d = deps();
    await createPipelineV2Port(d).run("conv#fresh", [textMsg(1000, "land plot")]);

    // The owner is resolved as a `line` identity keyed on the conversation key.
    expect(findOrCreateUserByIdentity).toHaveBeenCalledWith(
      d.db,
      "line",
      "conv#fresh",
      "conv#fresh",
    );
    expect(runPipeline.mock.calls[0]?.[2]).toMatchObject({ ownerUserId: "owner-fresh" });
  });

  it("degrades a photo to an unclassified row when its derivative build fails (no throw)", async () => {
    buildDerivatives
      .mockResolvedValueOnce({ visionKey: "v0", thumbKey: "t0", visionJpeg: new Uint8Array([1]) })
      .mockRejectedValueOnce(new Error("sharp: unsupported image"));
    runPipeline.mockResolvedValue({ listings: [], droppedSegments: [] });
    const d = deps();

    await createPipelineV2Port(d).run("conv#1", [
      imageMsg(1000, "good"),
      imageMsg(2000, "bad"),
      textMsg(3000, "two photos above"),
    ]);

    const photos = runPipeline.mock.calls[0]?.[2]?.photos;
    expect(photos).toHaveLength(2);
    expect(photos[0]).toMatchObject({ index: 0, s3Key: "good", thumbKey: "t0" });
    expect(photos[0].vision).toBeDefined();
    // The failed build degrades to {index, s3Key} with no derivatives — never aborts the sweep.
    expect(photos[1]).toEqual({ index: 1, s3Key: "bad" });
    expect(photos[1].vision).toBeUndefined();
    expect(d.logger.warns).toHaveLength(1);
  });

  it("threads parsed geo hints from the chat text into the pipeline input", async () => {
    buildDerivatives.mockResolvedValue({
      visionKey: "v",
      thumbKey: "t",
      visionJpeg: new Uint8Array([1]),
    });
    runPipeline.mockResolvedValue({ listings: [], droppedSegments: [] });
    const d = deps();
    await createPipelineV2Port(d).run("conv#1", [
      textMsg(1000, "see https://maps.google.com/maps?q=18.7883,98.9853"),
    ]);
    const input = runPipeline.mock.calls[0]?.[2];
    expect(input.geoHints).toEqual(["18.7883,98.9853"]);
    expect(input.contentLang).toBe("th");
  });
});

// ---------------------------------------------------------------------------
// Stage 5, Build C — source-group + membership population and the gate-pass claim DM.
// ---------------------------------------------------------------------------

const passGate = { pass: true };
const failGate = { pass: false };

function listing(listingId: string, gate: { pass: boolean }, title = "A listing") {
  return { listingId, title, decision: { decision: "new" }, gate };
}

describe("createPipelineV2Port.run — group/membership population (the launch blocker)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Distinct pg user ids per subject so the membership writes can be told apart by user.
    findOrCreateUserByIdentity.mockImplementation(
      async (_db: unknown, _provider: unknown, subject: string) => ({ id: `pg-${subject}` }),
    );
    findOrCreateGroupByLineGroupId.mockResolvedValue({ id: "grp-pg-1", lineGroupId: "Cgrp1" });
    upsertMembership.mockResolvedValue(undefined);
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({ listings: [], droppedSegments: [] });
  });

  it("upserts the source group from the conversation key and passes its id as sourceGroupId", async () => {
    const d = deps();
    await createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "house for sale")]);

    // The Postgres group is found-or-created from the LINE group id parsed out of the key.
    expect(findOrCreateGroupByLineGroupId).toHaveBeenCalledWith(d.db, "Cgrp1");
    // …and its id is now threaded into the pipeline input (previously dropped → always NULL).
    expect(runPipeline.mock.calls[0]?.[2]).toMatchObject({ sourceGroupId: "grp-pg-1" });
  });

  it("writes a membership for EVERY distinct real sender in the batch (resolving each to a pg user)", async () => {
    const d = deps();
    await createPipelineV2Port(d).run("group#Cgrp1", [
      groupTextMsg(1000, "first", "Ualice"),
      groupTextMsg(2000, "second", "Ubob"),
      groupTextMsg(3000, "alice again", "Ualice"), // duplicate sender → one membership
    ]);

    // Two DISTINCT senders → two membership upserts (deduped), each scoped to the pg group id +
    // the sender's resolved pg user id.
    expect(upsertMembership).toHaveBeenCalledTimes(2);
    const written = upsertMembership.mock.calls.map((c) => c[1]);
    expect(written).toEqual(
      expect.arrayContaining([
        { groupId: "grp-pg-1", userId: "pg-Ualice" },
        { groupId: "grp-pg-1", userId: "pg-Ubob" },
      ]),
    );
    // The real senders were resolved as `line` identities (the same lookup the LIFF token resolves to).
    expect(findOrCreateUserByIdentity).toHaveBeenCalledWith(d.db, "line", "Ualice", "LINE user");
    expect(findOrCreateUserByIdentity).toHaveBeenCalledWith(d.db, "line", "Ubob", "LINE user");
  });

  it("does NOT touch groups/memberships for a 1:1 (user#) conversation — no source group", async () => {
    const d = deps();
    await createPipelineV2Port(d).run("user#Upeer", [textMsg(1000, "house for sale")]);

    expect(findOrCreateGroupByLineGroupId).not.toHaveBeenCalled();
    expect(upsertMembership).not.toHaveBeenCalled();
    // A DM's listings carry no source group.
    expect(runPipeline.mock.calls[0]?.[2]?.sourceGroupId).toBeUndefined();
  });
});

describe("createPipelineV2Port.run — gate-pass claim DM (once, prospective)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOrCreateUserByIdentity.mockResolvedValue({ id: "owner-1" });
    findOrCreateGroupByLineGroupId.mockResolvedValue({ id: "grp-pg-1", lineGroupId: "Cgrp1" });
    upsertMembership.mockResolvedValue(undefined);
  });

  it("sends exactly ONE claim DM for a gate-passed listing, to the batch's primary sender", async () => {
    markClaimInvited.mockResolvedValue(true); // first invite → this sweep stamps + sends
    runPipeline.mockResolvedValue({
      listings: [listing("L-pass", passGate, "Condo near Nimman")],
      droppedSegments: [],
    });
    const gw = makeGateway();
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    await createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "post", "Uposter")]);

    expect(markClaimInvited).toHaveBeenCalledWith(d.db, "L-pass", expect.any(Date));
    expect(gw.pushes).toHaveLength(1);
    // The DM targets the real sender (a 1:1 DM to the poster), not the group.
    expect(gw.pushes[0]?.to).toBe("Uposter");
    // It's a Flex claim card whose CTA deep-links to {miniappUrl}/claim/{id}.
    const msg = gw.pushes[0]?.messages[0] as unknown as {
      type: string;
      cards: Array<{ actions: Array<{ uri?: string }> }>;
    };
    expect(msg.type).toBe("flex");
    expect(msg.cards[0]?.actions[0]?.uri).toBe("https://miniapp.line.me/123-abc/claim/L-pass");
  });

  it("a SECOND sweep of the same listing sends NO DM (the claim_invited_at guard)", async () => {
    // markClaimInvited returns false → the listing was already invited on a prior sweep.
    markClaimInvited.mockResolvedValue(false);
    runPipeline.mockResolvedValue({
      listings: [listing("L-pass", passGate)],
      droppedSegments: [],
    });
    const gw = makeGateway();
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    await createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "re-post", "Uposter")]);

    // The guard was consulted, but no push happened.
    expect(markClaimInvited).toHaveBeenCalledTimes(1);
    expect(gw.pushes).toHaveLength(0);
  });

  it("a NON-gate-pass listing is never invited (no guard stamp, no DM)", async () => {
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({
      listings: [listing("L-fail", failGate)],
      droppedSegments: [],
    });
    const gw = makeGateway();
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    await createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "weak post", "Uposter")]);

    // A failing gate is skipped BEFORE the guard — claim_invited_at is never burned on a non-pass.
    expect(markClaimInvited).not.toHaveBeenCalled();
    expect(gw.pushes).toHaveLength(0);
  });

  it("only the gate-passed listings of a mixed batch get a DM", async () => {
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({
      listings: [
        listing("L-pass-1", passGate, "Pass one"),
        listing("L-fail", failGate, "Fail"),
        listing("L-pass-2", passGate, "Pass two"),
      ],
      droppedSegments: [],
    });
    const gw = makeGateway();
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    await createPipelineV2Port(d).run("group#Cgrp1", [
      groupTextMsg(1000, "two good one bad", "Uposter"),
    ]);

    expect(gw.pushes).toHaveLength(2);
    const uris = gw.pushes.map(
      (p) =>
        (p.messages[0] as unknown as { cards: Array<{ actions: Array<{ uri?: string }> }> })
          .cards[0]?.actions[0]?.uri,
    );
    expect(uris).toEqual([
      "https://miniapp.line.me/123-abc/claim/L-pass-1",
      "https://miniapp.line.me/123-abc/claim/L-pass-2",
    ]);
  });

  it("skips the DM entirely (and does NOT stamp the guard) when no miniappUrl is configured", async () => {
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({
      listings: [listing("L-pass", passGate)],
      droppedSegments: [],
    });
    const gw = makeGateway();
    // No miniappUrl → the claim deep link can't resolve, so the whole invite step is skipped.
    const d = deps({ gateway: gw });

    await createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "post", "Uposter")]);

    expect(gw.pushes).toHaveLength(0);
    // Crucially the guard is NOT consulted — once the URL is set later, the listing still gets its DM.
    expect(markClaimInvited).not.toHaveBeenCalled();
  });

  it("skips the DM (no stamp) for a 1:1-sourced listing — no source group → the claim screen would 404", async () => {
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({
      listings: [listing("L-pass", passGate)],
      droppedSegments: [],
    });
    const gw = makeGateway();
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    // A 1:1 (`user#…`) conversation: the listing has no source group, so the claim gate can't admit
    // anyone — DMing a deep link that dead-ends in 404 would just confuse. Skip it (and don't stamp).
    await createPipelineV2Port(d).run("user#Upeer", [textMsg(1000, "house for sale")]);

    expect(runPipeline.mock.calls[0]?.[2]?.sourceGroupId).toBeUndefined();
    expect(gw.pushes).toHaveLength(0);
    expect(markClaimInvited).not.toHaveBeenCalled();
  });

  it("a failed claim DM push never throws out of the sweep (best-effort)", async () => {
    markClaimInvited.mockResolvedValue(true);
    runPipeline.mockResolvedValue({
      listings: [listing("L-pass", passGate)],
      droppedSegments: [],
    });
    const gw = makeGateway();
    gw.push.mockRejectedValueOnce(new Error("LINE 500"));
    const d = deps({ gateway: gw, miniappUrl: "https://miniapp.line.me/123-abc" });

    await expect(
      createPipelineV2Port(d).run("group#Cgrp1", [groupTextMsg(1000, "post", "Uposter")]),
    ).resolves.toBeDefined();
  });
});
