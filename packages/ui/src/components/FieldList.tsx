interface FieldListProps {
  rows: Array<{ label: string; value: string }>;
}

/** Direction-a `.spec-table`: a bordered label/value table — muted label cell (surface-2) + a
 * divider per row, value cell semibold. Thai label/value use leading-relaxed (TH-06/07). */
export function FieldList({ rows }: FieldListProps) {
  return (
    <dl className="m-0 grid overflow-hidden rounded-md border border-border font-body-th">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex ${i < rows.length - 1 ? "border-border border-b" : ""}`}
        >
          <dt className="flex w-[120px] shrink-0 items-center border-border border-r bg-surface-2 px-3 py-2 text-sm text-text-2 leading-relaxed">
            {row.label}
          </dt>
          <dd className="m-0 flex flex-1 items-center break-words bg-surface px-3 py-2 font-semibold text-sm text-text leading-relaxed [overflow-wrap:anywhere]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
