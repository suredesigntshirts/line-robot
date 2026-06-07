import { describe, expect, it } from "vitest";
import type { PropertyPhoto } from "../../src/core/domain/catalog.js";
import { heroPhotoKey, orderedPhotos, PHOTO_KIND_ORDER } from "../../src/core/domain/photos.js";

const photo = (s3Key: string, kind: PropertyPhoto["kind"]): PropertyPhoto => ({ s3Key, kind });

describe("PHOTO_KIND_ORDER", () => {
  it("orders property → chanote → other", () => {
    expect(PHOTO_KIND_ORDER).toEqual({ property: 0, chanote: 1, other: 2 });
  });
});

describe("orderedPhotos", () => {
  it("sorts mixed kinds property → chanote → other", () => {
    const out = orderedPhotos([
      photo("doc.jpg", "other"),
      photo("deed.jpg", "chanote"),
      photo("house.jpg", "property"),
    ]);
    expect(out.map((p) => p.s3Key)).toEqual(["house.jpg", "deed.jpg", "doc.jpg"]);
  });
  it("is a stable sort: capture order is preserved within a kind", () => {
    const out = orderedPhotos([
      photo("a.jpg", "property"),
      photo("b.jpg", "property"),
      photo("c.jpg", "property"),
    ]);
    expect(out.map((p) => p.s3Key)).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
  });
  it("returns [] for undefined and never mutates the input", () => {
    expect(orderedPhotos(undefined)).toEqual([]);
    const src = [photo("z.jpg", "other"), photo("y.jpg", "property")];
    const out = orderedPhotos(src);
    expect(out).not.toBe(src);
    expect(src.map((p) => p.s3Key)).toEqual(["z.jpg", "y.jpg"]); // input unchanged
  });
});

describe("heroPhotoKey", () => {
  it("returns the first property photo's key", () => {
    expect(heroPhotoKey([photo("doc.jpg", "other"), photo("house.jpg", "property")])).toBe(
      "house.jpg",
    );
  });
  it("falls back to the first photo when no property kind is present", () => {
    expect(heroPhotoKey([photo("deed.jpg", "chanote"), photo("doc.jpg", "other")])).toBe(
      "deed.jpg",
    );
  });
  it("returns undefined for undefined or empty", () => {
    expect(heroPhotoKey(undefined)).toBeUndefined();
    expect(heroPhotoKey([])).toBeUndefined();
  });
});
