import { beforeEach, describe, expect, it, vi } from "vitest";

// `createPipelineV2Port` is now the SOLE extraction path (the v1 claudeExtractor was deleted in A3),
// so its orchestration and the transcript it builds for the segmenter need direct coverage (the A3
// deferral folded into the Stage 2 gate). We mock the two cross-package seams it calls directly —
// `@line-robot/pipeline` (derivative build + the 6-step run) and `@line-robot/db` (owner lookup) —
// so the test exercises the wiring without standing up Postgres or sharp. The real pipeline +
// Postgres round-trip is covered by the pipeline package's integration test.

// vi.mock factories are hoisted above top-level declarations, so the mock fns must be created via
// vi.hoisted() (which is hoisted with them) rather than as plain consts.
const { runPipeline, buildDerivatives, findUserByIdentity, createUserWithIdentity } = vi.hoisted(
  () => ({
    runPipeline: vi.fn(),
    buildDerivatives: vi.fn(),
    findUserByIdentity: vi.fn(),
    createUserWithIdentity: vi.fn(),
  }),
);

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
  findUserByIdentity,
  createUserWithIdentity,
}));

import type { Db } from "@line-robot/db";
import type { MediaStore, StepLlm } from "@line-robot/pipeline";
import {
  buildTranscript,
  type ClassifiedMedia,
  createPipelineV2Port,
} from "../../src/app/pipelineV2Sweep.js";
import type { StoredMessage } from "../../src/core/domain/message.js";
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
    expect(buildTranscript([], [])).toEqual({ transcript: "", mapLinks: [] });
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

const deps = () => ({
  db: {} as Db,
  llm: {} as StepLlm,
  media: {} as MediaStore,
  logger: makeLogger(),
});

describe("createPipelineV2Port.run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default owner lookup: a user already exists, so no create.
    findUserByIdentity.mockResolvedValue({ id: "owner-1" });
    createUserWithIdentity.mockResolvedValue({ id: "owner-new" });
  });

  it("short-circuits an empty batch without calling the pipeline", async () => {
    const d = deps();
    const out = await createPipelineV2Port(d).run("conv#1", []);
    expect(out).toEqual([]);
    expect(runPipeline).not.toHaveBeenCalled();
    // Empty transcript → the "nothing to extract" branch, owner never resolved.
    expect(findUserByIdentity).not.toHaveBeenCalled();
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

  it("creates the owner user when none exists for the conversation key", async () => {
    findUserByIdentity.mockResolvedValue(null);
    runPipeline.mockResolvedValue({ listings: [], droppedSegments: [] });
    const d = deps();
    await createPipelineV2Port(d).run("conv#fresh", [textMsg(1000, "land plot")]);

    expect(createUserWithIdentity).toHaveBeenCalledTimes(1);
    // The pipeline is invoked with the newly-created owner id.
    expect(runPipeline.mock.calls[0]?.[2]).toMatchObject({ ownerUserId: "owner-new" });
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
