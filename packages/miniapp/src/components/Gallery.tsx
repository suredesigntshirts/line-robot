/** A swipeable photo strip (scroll-snap, one image per flick via `scroll-snap-stop: always`) with
 * per-photo kind/label captions, in the API's property → chanote → other order. Tapping a photo
 * opens a full-screen lightbox that is itself a snap strip — so you can swipe left/right between
 * images at full size, one at a time. */

import type { Photo } from "@line-robot/shared";
import { useEffect, useRef, useState } from "preact/hooks";

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
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

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
              <button type="button" class="gallery-btn" onClick={() => setLightboxAt(i)}>
                <img src={photo.url} alt={cap} loading="lazy" />
              </button>
              <figcaption class="muted small">{cap}</figcaption>
            </figure>
          );
        })}
      </div>

      {lightboxAt !== null ? (
        <Lightbox photos={photos} startAt={lightboxAt} onClose={() => setLightboxAt(null)} />
      ) : null}
    </>
  );
}

/** Full-screen swipeable viewer: a horizontal snap strip of every photo, opened scrolled to the
 * tapped one. One image per swipe (`scroll-snap-stop: always`); the × button closes it. */
function Lightbox({
  photos,
  startAt,
  onClose,
}: {
  photos: readonly Photo[];
  startAt: number;
  onClose: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  // Jump (no smooth scroll) to the tapped image once the strip is laid out. Slides are full-viewport
  // wide, so a slide's offsetLeft is known immediately — no need to wait for the image to load.
  useEffect(() => {
    const strip = stripRef.current;
    const slide = strip?.children[startAt] as HTMLElement | undefined;
    if (strip !== null && slide !== undefined) {
      strip.scrollLeft = slide.offsetLeft;
    }
  }, [startAt]);

  return (
    <div class="lightbox">
      <button type="button" class="lightbox-close" aria-label="Close photo" onClick={onClose}>
        ×
      </button>
      <div class="lightbox-strip" ref={stripRef}>
        {photos.map((photo, i) => (
          <div class="lightbox-slide" key={`${photo.url}-${i}`}>
            <img class="lightbox-img" src={photo.url} alt={caption(photo)} />
          </div>
        ))}
      </div>
    </div>
  );
}
