import type { ReactNode } from "react";

/** Mobile-first page shell — verified at 360–390px (TH-09). */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body-th)",
        lineHeight: "var(--leading-body)",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "var(--spacing-4)",
          display: "grid",
          gap: "var(--spacing-4)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Card grid: single column on phones, two columns from ~640px. */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--spacing-3)",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}
