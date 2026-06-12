import type { Translator } from "../i18n/index.ts";

interface GalleryProps {
  photos: Array<{ url: string; alt: string }>;
  /** Index of the currently shown photo. */
  current: number;
  onSelect: (index: number) => void;
  t: Translator;
}

/**
 * CONV-05 detail gallery: main photo + a THUMBNAIL STRIP and an explicit
 * count — never dots-only (thumbnails let buyers jump to the chanote shot).
 */
export function Gallery({ photos, current, onSelect, t }: GalleryProps) {
  const shown = photos[current] ?? photos[0];
  return (
    <div style={{ display: "grid", gap: "var(--spacing-2)" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          background: "var(--color-surface-2)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {shown && (
          <img
            src={shown.url}
            alt={shown.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <span
          style={{
            position: "absolute",
            right: "var(--spacing-2)",
            bottom: "var(--spacing-2)",
            background: "var(--color-text)",
            color: "var(--color-surface)",
            borderRadius: "var(--radius-sm)",
            padding: "0 var(--spacing-2)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-latin)",
          }}
        >
          {t("listing.photos", { count: photos.length })}
        </span>
      </div>
      <div style={{ display: "flex", gap: "var(--spacing-1)", overflowX: "auto" }}>
        {photos.map((photo, i) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={i === current}
            style={{
              flex: "0 0 64px",
              height: 48,
              padding: 0,
              border:
                i === current
                  ? "2px solid var(--color-primary-500)"
                  : "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              background: "var(--color-surface-2)",
              cursor: "pointer",
            }}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
