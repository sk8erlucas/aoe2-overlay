import { parseNote, type Step } from "@age-overlay/shared";
import { useLang, useT } from "../lib/i18n";

const RESOURCES = [
  { key: "wood", icon: "🪵" },
  { key: "food", icon: "🍖" },
  { key: "gold", icon: "🪙" },
  { key: "stone", icon: "🪨" },
  { key: "builder", icon: "🔨" },
] as const;

export function Resources({ step }: { step: Step }) {
  const t = useT();
  return (
    <div className="resources">
      {RESOURCES.map(({ key, icon }) => {
        const label = t(`res.${key}`);
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
  const lang = useLang();
  return (
    <li>
      {parseNote(text, lang).map((seg, i) =>
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
