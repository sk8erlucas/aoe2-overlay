import { parseNote, type Step } from "@age-overlay/shared";

const RESOURCES = [
  { key: "wood", icon: "🪵", label: "Madera" },
  { key: "food", icon: "🍖", label: "Comida" },
  { key: "gold", icon: "🪙", label: "Oro" },
  { key: "stone", icon: "🪨", label: "Piedra" },
  { key: "builder", icon: "🔨", label: "Construyendo" },
] as const;

export function Resources({ step }: { step: Step }) {
  return (
    <div className="resources">
      {RESOURCES.map(({ key, icon, label }) => {
        const value = step.resources[key];
        if (key === "builder" && !value) return null;
        return (
          <span key={key} className={`res res-${key}`} title={label}>
            <span aria-hidden>{icon}</span>
            {value ?? 0}
          </span>
        );
      })}
    </div>
  );
}

export function Note({ text }: { text: string }) {
  return (
    <li>
      {parseNote(text).map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <span key={i} className="icon-chip" title={seg.path}>
            {seg.label}
          </span>
        ),
      )}
    </li>
  );
}

export function StepNotes({ step }: { step: Step }) {
  return (
    <ul className="notes">
      {step.notes.map((n, i) => (
        <Note key={i} text={n} />
      ))}
    </ul>
  );
}
