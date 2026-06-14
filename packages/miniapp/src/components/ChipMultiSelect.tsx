/**
 * A multi-select chip row (Stage 6 — the role-application preference axes). Each option is a pill
 * toggle; tapping flips its membership in the `selected` set. An EMPTY selection means "any" on that
 * axis (the caller stores `[]`), so there's no "all" affordance — leaving every chip off IS "all".
 *
 * Each chip is a small pill CONTROL (a `<button>`), so it is correctly exempt from the TH-07 body
 * line-height net (which measures body copy, not loopless/short controls — the assertThaiBodyLineHeight
 * invariant skips an element whose nearest `<button>` ancestor isn't the card root). Authored in
 * Tailwind utilities over the shared `@theme` tokens — NO inline styles.
 */

export function ChipMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: ReadonlyArray<{ id: string; label: string }>;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(id: string): void {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={on}
            data-chip={opt.id}
            data-selected={on}
            onClick={() => toggle(opt.id)}
            className={`rounded-full border px-3 py-1.5 font-body-th text-sm leading-relaxed transition-colors ${
              on
                ? "border-primary-500 bg-primary-500 text-surface"
                : "border-border bg-surface text-text-2"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
