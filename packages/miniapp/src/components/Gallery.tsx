/** A swipeable photo strip (scroll-snap) with per-photo kind/label captions, in the API's
 * property → chanote → other order. Tapping a photo opens a full-screen lightbox that allows native
 * pinch-zoom (`touch-action: pinch-zoom`). */

import type { Photo } from "@line-robot/shared";
import { useState } from "preact/hooks";

const KIND_LABEL: Record<string, string> = {
  property: "Photo",
  chanote: "Title deed",
  other: "Document",
};

function caption(photo: Photo): string {
  const kind = KIND_LABEL[photo.kind] ?? photo.kind;
  return photo.label !== undefined && photo.label !== "" ? `${kind} · ${photo.label}` : kind;
}

export function Gallery({ photos }: { photos: readonly Photo[] }) {
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div class="gallery">
        {photos.map((photo, i) => {
          const cap = caption(photo);
          return (
            <figure class="gallery-item" key={`${photo.url}-${i}`}>
              <button type="button" class="gallery-btn" onClick={() => setFullscreen(photo.url)}>
                <img src={photo.url} alt={cap} loading="lazy" />
              </button>
              <figcaption class="muted small">{cap}</figcaption>
            </figure>
          );
        })}
      </div>

      {fullscreen !== null ? (
        <button
          type="button"
          class="lightbox"
          aria-label="Close photo"
          onClick={() => setFullscreen(null)}
        >
          <img class="lightbox-img" src={fullscreen} alt="" />
        </button>
      ) : null}
    </>
  );
}
