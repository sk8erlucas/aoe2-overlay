import { formatClock, type StepPosition } from "@age-overlay/shared";
import { AGE_NAMES, type LoadedStrategy } from "../lib/strategies";
import type { Settings } from "../lib/settings";
import { Resources, StepNotes } from "./StepCard";

interface Props {
  strategy: LoadedStrategy | undefined;
  position: StepPosition;
  gameSeconds: number;
  running: boolean;
  flash: boolean;
  settings: Settings;
}

/** Vista compacta que se ve durante la partida (modo juego, click-through). */
export function GameView({ strategy, position, gameSeconds, running, flash, settings }: Props) {
  const { hotkeys } = settings;

  if (!strategy) {
    return (
      <div className="game empty">
        <p>No hay estrategia elegida.</p>
        <p className="hint">{hotkeys.toggleMode} para elegir una</p>
      </div>
    );
  }

  const steps = strategy.build_order;
  const current = steps[position.index]!;
  const next = position.nextIndex === null ? undefined : steps[position.nextIndex];

  return (
    <div className="game">
      <header className="game-header">
        <span className={`clock ${running ? "" : "paused"}`}>
          {running ? "⏱" : "⏸"} {formatClock(gameSeconds)}
        </span>
        <span className="age">{AGE_NAMES[current.age]}</span>
        <span className="step-count">
          {position.index + 1}/{steps.length}
        </span>
      </header>

      <section className={`current ${flash ? "flash" : ""}`}>
        <div className="current-meta">
          <strong>{current.villager_count} aldeanos</strong>
          <Resources step={current} />
        </div>
        <StepNotes step={current} />
      </section>

      {next && (
        <section className="next">
          <div className="next-meta">
            Siguiente en <strong>{formatClock(position.secondsToNext ?? 0)}</strong> ·{" "}
            {next.villager_count} ald.
          </div>
          <StepNotes step={next} />
        </section>
      )}

      {!running && gameSeconds === 0 && (
        <p className="hint">{hotkeys.startPause} al empezar la partida</p>
      )}
    </div>
  );
}
