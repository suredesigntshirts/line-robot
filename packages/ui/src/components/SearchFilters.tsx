import type { CSSProperties } from "react";
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

const chipStyle = (active: boolean): CSSProperties => ({
  padding: "var(--spacing-1) var(--spacing-3)",
  borderRadius: "var(--radius-full)",
  border: active ? "1px solid var(--color-primary-500)" : "1px solid var(--color-border-2)",
  background: active ? "var(--color-primary-50)" : "var(--color-surface)",
  color: active ? "var(--color-primary-700)" : "var(--color-text)",
  fontSize: "var(--text-sm)",
  fontFamily: "var(--font-body-th)",
  lineHeight: "var(--leading-body)",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

/**
 * COMP-05/06 chip facets. Fully stateless (value + onChange; no fetch, D3.9) —
 * the host app owns querying. Horizontal scroll keeps 360px viable (TH-09).
 */
export function SearchFilters({ groups, value, onChange, t }: SearchFiltersProps) {
  const toggle = (chipId: string) =>
    onChange(value.includes(chipId) ? value.filter((id) => id !== chipId) : [...value, chipId]);

  return (
    <div style={{ display: "grid", gap: "var(--spacing-2)", fontFamily: "var(--font-body-th)" }}>
      {groups.map((group) => (
        <div key={group.id} style={{ display: "grid", gap: "var(--spacing-1)" }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>
            {group.label}
          </span>
          <div style={{ display: "flex", gap: "var(--spacing-1)", overflowX: "auto" }}>
            {group.chips.map((chip) => {
              const active = value.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(chip.id)}
                  style={chipStyle(active)}
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
          style={{
            ...chipStyle(false),
            justifySelf: "start",
            color: "var(--color-text-2)",
            border: "1px dashed var(--color-border-2)",
          }}
        >
          {t("filter.clear")}
        </button>
      )}
    </div>
  );
}
