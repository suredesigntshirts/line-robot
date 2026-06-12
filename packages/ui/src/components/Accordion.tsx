import type { ReactNode } from "react";

interface AccordionSectionProps {
  title: string;
  /** CONV-05: the chanote/title-deed section ships default-expanded. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Native <details>/<summary> — collapsible, accessible, zero JS state.
 * (Deviation from D3.1's shadcn/Radix accordion, logged: one native element
 * beats a dependency tree for this shape; revisit if Stage 4/5 need animation.)
 */
export function AccordionSection({ title, defaultOpen = false, children }: AccordionSectionProps) {
  return (
    <details
      open={defaultOpen}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-3)",
        fontFamily: "var(--font-body-th)",
        lineHeight: "var(--leading-body)",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "var(--text-md)",
          fontFamily: "var(--font-heading-th)",
          color: "var(--color-text)",
        }}
      >
        {title}
      </summary>
      <div style={{ paddingTop: "var(--spacing-3)" }}>{children}</div>
    </details>
  );
}
