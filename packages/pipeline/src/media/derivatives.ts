import sharp from "sharp";
import type { MediaStore } from "../ports.ts";

// ---------------------------------------------------------------------------
// D2.7: exactly two derivatives per photo, produced BEFORE any vision call.
// - vision: long edge 1568px JPEG q80 (caps image tokens ~1600 vs ~4784)
// - thumb:  long edge 640px JPEG q70 (card carousel / LIFF detail)
// No responsive ladder; revisit only if the web design demands it.
// ---------------------------------------------------------------------------

export const VISION_LONG_EDGE = 1568;
export const THUMB_LONG_EDGE = 640;

export interface DerivativeSet {
  visionKey: string;
  thumbKey: string;
  /** The vision bytes are returned so classify+ocr can call the model without re-reading S3. */
  visionJpeg: Uint8Array;
}

export function derivativeKey(
  propertyId: string,
  photoId: string,
  kind: "vision" | "thumb",
): string {
  return `derivatives/${propertyId}/${photoId}-${kind}.jpg`;
}

async function downscale(original: Uint8Array, longEdge: number, quality: number): Promise<Uint8Array> {
  return sharp(original)
    .rotate() // honor EXIF orientation before resizing
    .resize(longEdge, longEdge, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
}

/** Produce + store both derivatives for one photo; returns keys + vision bytes. */
export async function buildDerivatives(
  store: MediaStore,
  originalKey: string,
  propertyId: string,
  photoId: string,
): Promise<DerivativeSet> {
  const { bytes } = await store.getOriginal(originalKey);
  const [visionJpeg, thumbJpeg] = await Promise.all([
    downscale(bytes, VISION_LONG_EDGE, 80),
    downscale(bytes, THUMB_LONG_EDGE, 70),
  ]);
  const visionKey = derivativeKey(propertyId, photoId, "vision");
  const thumbKey = derivativeKey(propertyId, photoId, "thumb");
  await Promise.all([
    store.putDerivative(visionKey, visionJpeg, "image/jpeg"),
    store.putDerivative(thumbKey, thumbJpeg, "image/jpeg"),
  ]);
  return { visionKey, thumbKey, visionJpeg };
}
