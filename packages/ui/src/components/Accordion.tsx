import type { ReactNode } from "react";

interface AccordionSectionProps {
  title: string;
  /** CONV-05: the chanote/title-deed section ships default-expanded. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Native <details>/<summary> — collapsible, accessible, zero JS state. Direction-a `.desc-block`
 * treatment: a bordered card with a muted (surface-2) heading bar.
 * (Deviation from D3.1's shadcn/Radix accordion, logged: one native element beats a dependency tree
 * for this shape; revisit if Stage 4/5 need animation.)
 */
export function AccordionSection({ title, defaultOpen = false, children }: AccordionSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="overflow-hidden rounded-md border border-border bg-surface font-body-th leading-relaxed"
    >
      <summary className="cursor-pointer border-border border-b bg-surface-2 px-4 py-2.5 font-heading-th font-semibold text-text leading-normal">
        {title}
      </summary>
      <div className="px-4 py-3 text-text-2">{children}</div>
    </details>
  );
}
