/**
 * A small step-progress indicator (the claim mock's `.step-progress`): a row of numbered dots joined
 * by connectors, with a short label under each. Drives the claim flow's three steps
 * (ตรวจสอบ → อ้างสิทธิ์ → เผยแพร่). Presentational + token-only (no inline styles): the active dot is
 * `bg-primary-500`, completed dots are `bg-success`, pending dots are an outlined `bg-border`-toned
 * circle; the connector between two completed/active dots is `bg-success`, else `bg-border`.
 *
 * `current` is the 0-based index of the ACTIVE step; every step before it renders as done. The labels
 * are localized strings the caller passes (so no Thai is hardcoded here).
 */

interface StepperProps {
  /** The ordered step labels (left → right). */
  readonly steps: readonly string[];
  /** 0-based index of the active step (steps before it render as done). */
  readonly current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  // Precompute the per-step model once (state + a stable react key) so neither track keys off a bare
  // array index. `key` composes the label + position so it stays stable + unique even if two labels
  // ever coincide.
  const items = steps.map((label, i) => ({
    label,
    key: `${i}:${label}`,
    done: i < current,
    active: i === current,
    last: i === steps.length - 1,
    n: i + 1,
  }));
  return (
    <nav aria-label="progress" className="grid gap-1" data-stepper={current}>
      {/* The dot/connector track. Each connector before the active dot is "done" (success-toned). */}
      <ol className="m-0 flex list-none items-center p-0">
        {items.map((s) => (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <span
              aria-current={s.active ? "step" : undefined}
              data-step-state={s.done ? "done" : s.active ? "active" : "pending"}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 font-latin font-bold text-xs ${
                s.done
                  ? "border-success bg-success text-surface"
                  : s.active
                    ? "border-primary-500 bg-primary-500 text-surface"
                    : "border-border-2 bg-surface text-text-disabled"
              }`}
            >
              {s.done ? "✓" : s.n}
            </span>
            {!s.last && (
              <span
                aria-hidden="true"
                className={`mx-1 h-0.5 flex-1 ${s.done ? "bg-success" : "bg-border"}`}
              />
            )}
          </li>
        ))}
      </ol>

      {/* The labels under the dots — Thai body text, leading-relaxed (TH-07). */}
      <ol className="m-0 flex list-none justify-between p-0">
        {items.map((s) => (
          <li
            key={s.key}
            className={`font-body-th text-xs leading-relaxed ${
              s.done
                ? "text-success"
                : s.active
                  ? "font-semibold text-primary-600"
                  : "text-text-disabled"
            }`}
          >
            {s.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
