"use client";

/** Selector de varios valores: un <select> para agregar y chips para quitar. */
export function ChipSelect({
  label,
  value,
  options,
  onChange,
  emptyText,
}: {
  label: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  emptyText: string;
}) {
  const labelOf = (v: string) =>
    options.find((o) => o.value.toLowerCase() === v.toLowerCase())?.label ?? v;
  const remaining = options.filter(
    (o) => !value.some((v) => v.toLowerCase() === o.value.toLowerCase()),
  );

  return (
    <div className="text-sm">
      <span className="label text-xs text-ink/60">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {value.length === 0 && <span className="text-ink/50">{emptyText}</span>}
        {value.map((v) => (
          <button
            key={v}
            type="button"
            className="rounded-full bg-red/10 px-2.5 py-0.5 text-red hover:bg-red/20"
            onClick={() => onChange(value.filter((x) => x !== v))}
            title="Quitar"
          >
            {labelOf(v)} ×
          </button>
        ))}
      </div>
      <select
        className="field mt-1.5"
        value=""
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
      >
        <option value="">+ Agregar…</option>
        {remaining.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
