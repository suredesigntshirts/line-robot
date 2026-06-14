import type { Translator } from "../i18n/index.ts";

export interface FilterChip {
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  chips: FilterChip[];
}

interface SearchFiltersProps {
  groups: FilterGroup[];
  /** Selected chip ids (across all groups). */
  value: string[];
  onChange: (next: string[]) => void;
  t: Translator;
}

// Direction-a chip: a rounded pill. Active = FILLED trust-blue with white text (the mock's
// `.chip.active`); inactive = outline. text-sm + leading-relaxed keeps short Thai labels legible.
// Active = FILLED trust-blue. text-surface (NOT text-white) flips with the bg so the white-on-light-
// blue dark-mode AA failure can't happen (see assertCtaContrast / States.primaryButtonClass).
const chipClass = (active: boolean) =>
  `inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border px-3 py-1 font-body-th text-sm leading-relaxed transition-colors ${
    active
      ? "border-primary-500 bg-primary-500 font-semibold text-surface"
      : "border-border-2 bg-surface text-text-2 hover:border-primary-300 hover:text-text"
  }`;

/**
 * COMP-05/06 chip facets. Fully stateless (value + onChange; no fetch, D3.9) — the host app owns
 * querying. Grouped + labelled (clearer than the mock's single scroll row for our many facets);
 * each group's chips scroll horizontally to keep 360px viable (TH-09).
 */
export function SearchFilters({ groups, value, onChange, t }: SearchFiltersProps) {
  const toggle = (chipId: string) =>
    onChange(value.includes(chipId) ? value.filter((id) => id !== chipId) : [...value, chipId]);

  return (
    <div className="grid gap-2 font-body-th">
      {groups.map((group) => (
        <div key={group.id} className="grid gap-1">
          <span className="text-sm text-text-2 leading-relaxed">{group.label}</span>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {group.chips.map((chip) => {
              const active = value.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  // marks a FILLED CTA for the assertCtaContrast invariant (active chip only).
                  data-cta-solid={active || undefined}
                  onClick={() => toggle(chip.id)}
                  className={chipClass(active)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="inline-flex w-fit cursor-pointer items-center whitespace-nowrap rounded-full border border-border-2 border-dashed px-3 py-1 font-body-th text-sm text-text-2 leading-relaxed transition-colors hover:text-text"
        >
          {t("filter.clear")}
        </button>
      )}
    </div>
  );
}
