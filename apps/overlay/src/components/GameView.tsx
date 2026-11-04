import { formatClock, populationOf, type StepPosition } from "@age-overlay/shared";
import { useEffect, useRef } from "react";
import { setInteractiveRects } from "../lib/native";
import type { HotkeyAction, Settings } from "../lib/settings";
import { AGE_NAMES, type LoadedStrategy } from "../lib/strategies";
import { Resources, StepNotes } from "./StepCard";

interface Props {
  strategy: LoadedStrategy | undefined;
  position: StepPosition;
  gameSeconds: number;
  running: boolean;
  flash: boolean;
  settings: Settings;
  onAction: (action: HotkeyAction | "hide") => void;
}

/**
 * Le avisa a la parte nativa dónde están los botones: en modo juego solo esa zona
 * acepta clics, el resto de la ventana los deja pasar al juego.
 */
function useInteractiveZone<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => {
      const r = el.getBoundingClientRect();
      void setInteractiveRects([{ x: r.left, y: r.top, w: r.width, h: r.height }]);
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", report);
      void setInteractiveRects([]);
    };
  }, []);
  return ref;
}

function Controls({
  running,
  settings,
  onAction,
}: Pick<Props, "running" | "settings" | "onAction">) {
  const ref = useInteractiveZone<HTMLDivElement>();
  const k = settings.hotkeys;
  const btn = (action: HotkeyAction | "hide", label: string, title: string, cls = "") => (
    <button className={`ctl ${cls}`} title={title} onClick={() => onAction(action)}>
      {label}
    </button>
  );
  return (
    <div className="controls" ref={ref}>
      {btn("prevStep", "⏮", `Paso anterior (${k.prevStep})`)}
      {btn("minus5", "−5", `Atrasar 5 s (${k.minus5})`)}
      {btn(
        "startPause",
        running ? "⏸" : "▶",
        `${running ? "Pausar" : "Iniciar"} (${k.startPause})`,
        "main",
      )}
      {btn("plus5", "+5", `Adelantar 5 s (${k.plus5})`)}
      {btn("nextStep", "⏭", `Paso siguiente (${k.nextStep})`)}
      <span className="ctl-sep" />
      {btn("toggleMode", "⚙", `Modo edición (${k.toggleMode})`)}
      {btn("hide", "✕", `Ocultar (${k.toggleVisible}). Para salir: ícono de la bandeja`, "close")}
    </div>
  );
}

/** Vista compacta que se ve durante la partida (modo juego). */
export function GameView({
  strategy,
  position,
  gameSeconds,
  running,
  flash,
  settings,
  onAction,
}: Props) {
  if (!strategy) {
    return (
      <div className="game empty">
        <Controls running={running} settings={settings} onAction={onAction} />
        <p>No hay estrategia elegida.</p>
        <p className="hint">Tocá ⚙ o {settings.hotkeys.toggleMode} para elegir una</p>
      </div>
    );
  }

  const steps = strategy.build_order;
  const current = steps[position.index]!;
  const next = position.nextIndex === null ? undefined : steps[position.nextIndex];

  return (
    <div className="game">
      <header className="game-header">
        <span className={`clock ${running ? "" : "paused"}`}>{formatClock(gameSeconds)}</span>
        <span className="age">{AGE_NAMES[current.age]}</span>
        <span className="step-count">
          {position.index + 1}/{steps.length}
        </span>
      </header>
      <Controls running={running} settings={settings} onAction={onAction} />

      <section className={`current ${flash ? "flash" : ""}`}>
        <div className="current-meta">
          <span className="pop" title="Población total: aldeanos + explorador inicial">
            👥 <strong>{populationOf(current)}</strong>
            <span className="pop-detail"> ({current.villager_count} ald. + explorador)</span>
          </span>
          <Resources step={current} />
        </div>
        <StepNotes step={current} />
      </section>

      {next && (
        <section className="next">
          <div className="next-meta">
            Siguiente en <strong>{formatClock(position.secondsToNext ?? 0)}</strong> · pob.{" "}
            {populationOf(next)}
          </div>
          <StepNotes step={next} />
        </section>
      )}

      {!running && gameSeconds === 0 && (
        <p className="hint">Tocá ▶ o {settings.hotkeys.startPause} al empezar la partida</p>
      )}
    </div>
  );
}
