import {
  estimateStepTimes,
  formatClock,
  parseNote,
  populationOf,
  type Step,
} from "@age-overlay/shared";
import { AGE_LABELS } from "@/lib/labels";

const RES = [
  ["food", "🍖"],
  ["wood", "🪵"],
  ["gold", "🪙"],
  ["stone", "🪨"],
  ["builder", "🔨"],
] as const;

export function Note({ text }: { text: string }) {
  return (
    <>
      {parseNote(text).map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <span key={i} className="rounded bg-gold/25 px-1 font-semibold" title={seg.path}>
            {seg.label}
          </span>
        ),
      )}
    </>
  );
}

/** Pasos de la estrategia con el tiempo estimado (el mismo cálculo que usa el overlay). */
export function StepTimeline({ steps }: { steps: Step[] }) {
  const times = estimateStepTimes(steps);
  let lastAge = 0;

  return (
    <ol className="relative space-y-3 border-l-2 border-red/30 pl-6">
      {steps.map((step, i) => {
        const newAge = step.age !== lastAge;
        lastAge = step.age;
        return (
          <li key={i} className="relative">
            {newAge && (
              <p className="label -ml-6 mb-2 pl-6 text-xs text-red">{AGE_LABELS[step.age]}</p>
            )}
            <span className="absolute top-3 -left-[31px] h-3 w-3 rounded-full border-2 border-red bg-cream" />
            <div className="card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span
                  className="font-display text-xl text-red tabular-nums"
                  title="Tiempo de juego estimado"
                >
                  {formatClock(times[i] ?? 0)}
                </span>
                <span className="font-bold" title="Población total: aldeanos + explorador inicial">
                  👥 {populationOf(step)}{" "}
                  <span className="font-normal text-ink/60">
                    ({step.villager_count} ald. + explorador)
                  </span>
                </span>
                <span className="flex gap-3 text-ink/70">
                  {RES.map(([key, icon]) => {
                    const v = step.resources[key];
                    if (key === "builder" && !v) return null;
                    return (
                      <span key={key} title={key}>
                        {icon} {v ?? 0}
                      </span>
                    );
                  })}
                </span>
              </div>
              <ul className="list-disc space-y-1 pl-5">
                {step.notes.map((n, j) => (
                  <li key={j}>
                    <Note text={n} />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
