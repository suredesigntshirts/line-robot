/**
 * The detail photo gallery — a swipeable scroll-snap strip (one image per flick) with a full-screen
 * lightbox. Authored in **Tailwind utilities** (NOT the shared `@line-robot/ui` Gallery, which still
 * carries inline-style objects — plan-21's passes didn't cover island components; see the build
 * report's conformance note). No inline-style objects anywhere here. Photos are presigned thumbs from
 * packages/api (`photos[].url`).
 */
import { useEffect, useRef, useState } from "react";
import type { PhotoDto } from "../lib/types.ts";

export function Gallery({ photos, alt }: { photos: readonly PhotoDto[]; alt: string }) {
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {photos.map((photo, i) => (
          <button
            type="button"
            // biome-ignore lint/suspicious/noArrayIndexKey: presigned urls can repeat across kinds; index is stable within a render
            key={`${photo.url}-${i}`}
            onClick={() => setLightboxAt(i)}
            className="relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-surface-2 [scroll-snap-stop:always]"
          >
            <img
              src={photo.url}
              alt={`${alt} ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxAt !== null && (
        <Lightbox
          photos={photos}
          alt={alt}
          startAt={lightboxAt}
          onClose={() => setLightboxAt(null)}
        />
      )}
    </>
  );
}

/** Full-screen swipeable viewer — a horizontal snap strip of every photo, opened scrolled to the
 * tapped one. One image per swipe (`scroll-snap-stop: always`); the × button closes it. */
function Lightbox({
  photos,
  alt,
  startAt,
  onClose,
}: {
  photos: readonly PhotoDto[];
  alt: string;
  startAt: number;
  onClose: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const slide = strip?.children[startAt] as HTMLElement | undefined;
    if (strip && slide) strip.scrollLeft = slide.offsetLeft;
  }, [startAt]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <button
        type="button"
        aria-label="Close photo"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-2xl text-white"
      >
        ×
      </button>
      <div
        ref={stripRef}
        className="flex h-full snap-x snap-mandatory items-center overflow-x-auto"
      >
        {photos.map((photo, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: see Gallery
            key={`${photo.url}-${i}`}
            className="flex h-full w-screen shrink-0 snap-center [scroll-snap-stop:always] items-center justify-center p-4"
          >
            <img
              src={photo.url}
              alt={`${alt} ${i + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
