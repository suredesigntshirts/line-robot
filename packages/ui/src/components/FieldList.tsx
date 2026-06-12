interface FieldListProps {
  rows: Array<{ label: string; value: string }>;
}

/** Label/value rows for the detail screen; min-width labels budget Thai +20% (COPY-03). */
export function FieldList({ rows }: FieldListProps) {
  return (
    <dl
      style={{
        display: "grid",
        gap: "var(--spacing-2)",
        margin: 0,
        fontFamily: "var(--font-body-th)",
        fontSize: "var(--text-base)",
        lineHeight: "var(--leading-body)",
      }}
    >
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", gap: "var(--spacing-3)" }}>
          <dt style={{ minWidth: 120, color: "var(--color-text-2)", flexShrink: 0 }}>
            {row.label}
          </dt>
          <dd
            style={{
              margin: 0,
              color: "var(--color-text)",
              wordBreak: "normal",
              overflowWrap: "anywhere",
            }}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
