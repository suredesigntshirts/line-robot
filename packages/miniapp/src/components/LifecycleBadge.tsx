/**
 * The CRM lifecycle status pill (DF-4): ฉบับร่าง / ประกาศอยู่ / มีผู้สนใจ / ขายแล้ว / เช่าแล้ว / ถอนประกาศ.
 * Authored in Tailwind utilities reading the shared `@theme` badge tokens (paired bg+text, theme.css)
 * — NOT the shared shadcn Badge (whose variants don't carry the lifecycle palette). Matches the mock's
 * `.badge.badge-{kind}` colour map. The token classnames are spelled out (not interpolated) so
 * Tailwind's scanner keeps them.
 */
import type { Translator } from "@line-robot/ui";
import { type LifecycleKind, lifecycleLabelKey } from "../lib/display.ts";

// Map each lifecycle kind to a paired bg+text from the tokens theme.css ACTUALLY ships (the mock's
// inline :root invented --badge-draft/active/offer/sold/rented/withdrawn names that are NOT in the
// shared theme.css single source — see the build report's packages/ui gap note). We reuse the
// register-aligned badge tokens that exist, mapping by meaning: active→available (success green),
// offer→reserved (indigo), sold/rented→danger, draft/withdrawn→muted surface. Static so Tailwind's
// content scanner sees every class literally (no dynamic string building).
const KIND_CLASS: Record<LifecycleKind, string> = {
  draft: "bg-surface-2 text-text-2",
  active: "bg-[var(--badge-available)] text-[var(--badge-available-text)]",
  offer: "bg-[var(--badge-reserved)] text-[var(--badge-reserved-text)]",
  sold: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  rented: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  withdrawn: "bg-surface-2 text-text-disabled",
};

export function LifecycleBadge({ kind, t }: { kind: LifecycleKind; t: Translator }) {
  return (
    <span
      data-badge
      data-lifecycle={kind}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-body-th font-semibold text-xs ${KIND_CLASS[kind]}`}
    >
      {t(lifecycleLabelKey(kind))}
    </span>
  );
}
