import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the presigner: getSignedUrl echoes the requested Key so we can assert ordering + the bucket.
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(
    async (_client: unknown, command: { input: { Bucket: string; Key: string } }) => {
      if (command.input.Key === "boom") throw new Error("presign failed");
      return `https://signed.test/${command.input.Bucket}/${command.input.Key}`;
    },
  ),
}));
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {},
  GetObjectCommand: class {
    input: { Bucket: string; Key: string };
    constructor(input: { Bucket: string; Key: string }) {
      this.input = input;
    }
  },
}));

// media.ts memoizes the S3 client + bucket from env at first call, so re-import fresh per scenario.
async function freshMedia() {
  vi.resetModules();
  return import("../src/lib/media.ts");
}

const ORIG = process.env.ARCHIVE_BUCKET;
beforeEach(() => {
  process.env.ARCHIVE_BUCKET = "linerobot-staging-archive-test";
});
afterEach(() => {
  if (ORIG === undefined) delete process.env.ARCHIVE_BUCKET;
  else process.env.ARCHIVE_BUCKET = ORIG;
});

describe("presignThumbs", () => {
  it("presigns real keys against the configured bucket, preserving order", async () => {
    const { presignThumbs } = await freshMedia();
    expect(await presignThumbs(["derivatives/aaa-thumb.jpg", "derivatives/bbb-thumb.jpg"])).toEqual(
      [
        "https://signed.test/linerobot-staging-archive-test/derivatives/aaa-thumb.jpg",
        "https://signed.test/linerobot-staging-archive-test/derivatives/bbb-thumb.jpg",
      ],
    );
  });

  it("maps null/empty keys and presign failures to null (order kept), never throwing", async () => {
    const { presignThumbs } = await freshMedia();
    expect(
      await presignThumbs([null, "derivatives/a.jpg", "", "boom", "derivatives/b.jpg"]),
    ).toEqual([
      null,
      "https://signed.test/linerobot-staging-archive-test/derivatives/a.jpg",
      null,
      null, // the presigner threw → degraded to null, not a 500
      "https://signed.test/linerobot-staging-archive-test/derivatives/b.jpg",
    ]);
  });

  it("returns all-null (no crash) when ARCHIVE_BUCKET is unset — local dev / DB-less smoke", async () => {
    delete process.env.ARCHIVE_BUCKET;
    const { presignThumbs } = await freshMedia();
    expect(await presignThumbs(["derivatives/aaa-thumb.jpg", "derivatives/bbb-thumb.jpg"])).toEqual(
      [null, null],
    );
  });
});
