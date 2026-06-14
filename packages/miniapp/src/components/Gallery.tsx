/**
 * The detail photo gallery — mock-faithful and deliberately navigable (direction-a detail screen):
 * a large HERO photo (the active one) with a photo-count/position chip overlaid, and a THUMBNAIL row
 * beneath where tapping a thumb sets the active hero. The active photo is React state (`activeIndex`);
 * a horizontal swipe/scroll across the hero advances it too (one photo per snap). Tapping the hero
 * opens a full-screen lightbox. Authored in **Tailwind utilities** + `@line-robot/ui` tokens only — NO
 * inline-style objects, NO bespoke CSS (TECH-14/AP-9); the oklch/old-Android fallback rides on the
 * shared theme tokens (TECH-06 — this renders in LINE's WebView). Photos are presigned thumbs from
 * packages/api (`photos[].url`).
 */
import type { Translator } from "@line-robot/ui";
import { useEffect, useRef, useState } from "react";
import type { PhotoDto } from "../lib/types.ts";

export function Gallery({
  photos,
  alt,
  t,
}: {
  photos: readonly PhotoDto[];
  alt: string;
  t: Translator;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const heroStripRef = useRef<HTMLDivElement>(null);
  const thumbRowRef = useRef<HTMLDivElement>(null);

  // Guard the active index against an out-of-range value (e.g. photos shrank between renders). The
  // hooks below must run unconditionally, so the empty-set bail happens after them.
  const active = photos.length === 0 ? 0 : Math.min(activeIndex, photos.length - 1);

  // Keep the active (ring-marked) thumbnail in view — on 6+ photos a swipe-advanced active thumb can
  // sit off-screen otherwise. `scrollIntoView` is absent in some old WebViews / jsdom → guarded.
  useEffect(() => {
    const row = thumbRowRef.current;
    const thumb = row?.children[active] as HTMLElement | undefined;
    if (thumb && typeof thumb.scrollIntoView === "function") {
      thumb.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }, [active]);

  if (photos.length === 0) return null;

  // A deliberate thumbnail pick: set the active photo AND align the hero strip to it. The scroll is
  // INSTANT (no smooth animation): a smooth scroll's intermediate frames re-enter `onHeroScroll` and
  // would step `activeIndex` through every index in between (a visible chip/thumb flicker on a real
  // browser). Instant scroll fires at most one scroll event at the final position (a no-op, since the
  // state is already `i`). State is the single source of truth.
  const select = (i: number) => {
    setActiveIndex(i);
    const strip = heroStripRef.current;
    const slide = strip?.children[i] as HTMLElement | undefined;
    if (strip && slide) strip.scrollLeft = slide.offsetLeft;
  };

  // Swipe/scroll path: which hero slide is centred → that's the active photo (keeps the chip + the
  // active thumbnail in sync when the user flicks rather than taps a thumb).
  const onHeroScroll = () => {
    const strip = heroStripRef.current;
    if (!strip) return;
    const i = Math.round(strip.scrollLeft / strip.clientWidth);
    if (i !== active && i >= 0 && i < photos.length) setActiveIndex(i);
  };

  return (
    <section data-gallery data-photo-count={photos.length} className="grid gap-2">
      {/* HERO — a horizontal snap strip (one photo per flick); the active slide is the hero. The
          count/position chip overlays the bottom-left. Tapping opens the lightbox. */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-2">
        <div
          ref={heroStripRef}
          onScroll={onHeroScroll}
          data-gallery-hero-strip
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {photos.map((photo, i) => (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: presigned urls can repeat across kinds; index is stable within a render
              key={`${photo.url}-${i}`}
              onClick={() => setLightboxOpen(true)}
              aria-label={`${alt} ${i + 1}`}
              className="aspect-[16/9] w-full shrink-0 snap-center [scroll-snap-stop:always]"
            >
              <img
                src={photo.url}
                alt={`${alt} ${i + 1}`}
                {...(i === active ? { "data-gallery-hero": "" } : {})}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        <span
          data-photo-count-chip
          className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 font-latin font-semibold text-white text-xs leading-none"
        >
          {t("gallery.count", { index: active + 1, count: photos.length })}
        </span>
      </div>

      {/* THUMBNAIL row — tapping a thumb sets the active hero; the active thumb is ring-marked
          (data-active + aria-current). Hidden when there's only one photo (nothing to navigate). */}
      {photos.length > 1 && (
        <div
          ref={thumbRowRef}
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]"
        >
          {photos.map((photo, i) => (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: see hero
              key={`thumb-${photo.url}-${i}`}
              data-gallery-thumb={i}
              {...(i === active ? { "data-active": "", "aria-current": "true" } : {})}
              onClick={() => select(i)}
              aria-label={`${alt} ${i + 1}`}
              className={`relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border-2 bg-surface-2 ${
                i === active ? "border-primary-500" : "border-transparent"
              }`}
            >
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          alt={alt}
          startAt={active}
          t={t}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}

/** Full-screen swipeable viewer — a horizontal snap strip of every photo, opened scrolled to the
 * active one. One image per swipe (`scroll-snap-stop: always`); the × button closes it. A modal dialog
 * (role/aria-modal + Escape-to-close + the close button auto-focused on open). */
function Lightbox({
  photos,
  alt,
  startAt,
  t,
  onClose,
}: {
  photos: readonly PhotoDto[];
  alt: string;
  startAt: number;
  t: Translator;
  onClose: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const slide = strip?.children[startAt] as HTMLElement | undefined;
    if (strip && slide) strip.scrollLeft = slide.offsetLeft;
    closeRef.current?.focus();
  }, [startAt]);

  // Escape closes the modal (cheap a11y; keyboard users + WebViews that surface a hardware Esc).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      data-gallery-lightbox
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
    >
      <button
        type="button"
        ref={closeRef}
        aria-label={t("gallery.close")}
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
