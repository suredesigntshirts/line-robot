import sharp from "sharp";
import { describe, expect, it } from "vitest";
import type { MediaStore } from "../ports.ts";
import { buildDerivatives, THUMB_LONG_EDGE, VISION_LONG_EDGE } from "./derivatives.ts";

async function testImage(width: number, height: number): Promise<Uint8Array> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
}

function fakeStore(original: Uint8Array) {
  const put = new Map<string, Uint8Array>();
  const store: MediaStore = {
    getOriginal: () => Promise.resolve({ bytes: original, contentType: "image/jpeg" }),
    putDerivative: (key, bytes) => {
      put.set(key, bytes);
      return Promise.resolve();
    },
  };
  return { store, put };
}

describe("buildDerivatives (D2.7)", () => {
  it("produces exactly two derivatives at the spec'd long edges", async () => {
    const { store, put } = fakeStore(await testImage(4000, 3000));
    const result = await buildDerivatives(store, "conv/x/1/content.jpg");

    expect([...put.keys()].sort()).toEqual([result.thumbKey, result.visionKey].sort());
    expect(result.visionKey).toMatch(/^derivatives\/[0-9a-f]{16}-vision\.jpg$/);
    expect(result.thumbKey).toMatch(/^derivatives\/[0-9a-f]{16}-thumb\.jpg$/);
    // Stable + idempotent across re-sweeps of the same original.
    expect((await buildDerivatives(store, "conv/x/1/content.jpg")).visionKey).toBe(
      result.visionKey,
    );
    const vision = sharp(put.get(result.visionKey) as Uint8Array);
    const thumb = sharp(put.get(result.thumbKey) as Uint8Array);
    expect((await vision.metadata()).width).toBe(VISION_LONG_EDGE);
    expect((await thumb.metadata()).width).toBe(THUMB_LONG_EDGE);
  });

  it("never enlarges a small original", async () => {
    const { store, put } = fakeStore(await testImage(800, 600));
    const result = await buildDerivatives(store, "k");
    const meta = await sharp(put.get(result.visionKey) as Uint8Array).metadata();
    expect(meta.width).toBe(800);
  });

  it("returns the vision bytes for the classify step (no S3 re-read)", async () => {
    const { store, put } = fakeStore(await testImage(2000, 1500));
    const result = await buildDerivatives(store, "k");
    expect(result.visionJpeg).toEqual(put.get(result.visionKey));
  });

  it("portrait orientation: the LONG edge is capped, not the width", async () => {
    const { store, put } = fakeStore(await testImage(1500, 4000));
    const result = await buildDerivatives(store, "k");
    const meta = await sharp(put.get(result.visionKey) as Uint8Array).metadata();
    expect(meta.height).toBe(VISION_LONG_EDGE);
    expect(meta.width).toBeLessThan(VISION_LONG_EDGE);
  });
});
