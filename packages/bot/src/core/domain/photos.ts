/**
 * Pure photo-gallery ordering over the catalog's {@link PropertyPhoto} list. Shared by the chat
 * assistant ({@link ../handlers/catalogAssistant}) and the mini-app read API
 * ({@link ../../app/readApiHandler}) so the gallery order and hero selection are guaranteed identical
 * across both surfaces (compile-time, not comment-enforced). No IO — the presigning of the resulting
 * S3 keys is the caller's job.
 */
import type { PhotoKind, PropertyPhoto } from "./catalog.js";

/** Gallery order: property photos first, then chanote scans, then other documents (plan 13). Typed
 * over the full {@link PhotoKind} union so adding a new kind is a compile error here until ordered. */
export const PHOTO_KIND_ORDER: Record<PhotoKind, number> = { property: 0, chanote: 1, other: 2 };

/** Photos ordered property → chanote → other. Stable sort: within a kind, capture order is preserved.
 * Returns a fresh array (never mutates the input); `undefined` photos → `[]`. */
export function orderedPhotos(
  photos: readonly PropertyPhoto[] | undefined,
): readonly PropertyPhoto[] {
  if (photos === undefined) {
    return [];
  }
  return [...photos].sort((a, b) => PHOTO_KIND_ORDER[a.kind] - PHOTO_KIND_ORDER[b.kind]);
}

/** The hero image key: the first `property` photo, falling back to any image; `undefined` when none. */
export function heroPhotoKey(photos: readonly PropertyPhoto[] | undefined): string | undefined {
  if (photos === undefined || photos.length === 0) {
    return undefined;
  }
  return (photos.find((p) => p.kind === "property") ?? photos[0])?.s3Key;
}
