import { estimateStepTimes, getStepAt } from "@age-overlay/shared";
import { isTauri } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { GameView } from "./components/GameView";
import { SettingsView } from "./components/SettingsView";
import { SetupView } from "./components/SetupView";
import * as clock from "./lib/clock";
import {
  beep,
  onTrayToggleMode,
  registerHotkeys,
  resetPosition,
  setGameMode,
  showOverlay,
  toggleVisibility,
  type HotkeyError,
} from "./lib/native";
import { loadSettings, saveSettings, type HotkeyAction, type Settings } from "./lib/settings";
import { BUNDLED_STRATEGIES } from "./lib/strategies";

type Mode = "edit" | "game";
type Tab = "match" | "settings";

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  if (!settings) return null;
  return <Overlay initialSettings={settings} />;
}

function Overlay({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [mode, setMode] = useState<Mode>("edit");
  const [tab, setTab] = useState<Tab>("match");
  const [clockState, setClockState] = useState(clock.initialClock);
  const [now, setNow] = useState(() => performance.now());
  const [hotkeyErrors, setHotkeyErrors] = useState<HotkeyError[]>([]);
  const [flash, setFlash] = useState(false);

  // La ventana arranca oculta; se muestra cuando la UI ya está lista.
  useEffect(() => {
    void showOverlay();
  }, []);

  // --- Configuración ---
  const settingsRef = useRef(settings);
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const prev = settingsRef.current;
    if (patch.speed !== undefined && patch.speed !== prev.speed) {
      // Cambiar la velocidad no debe hacer saltar el reloj.
      setClockState((c) => clock.rebase(c, performance.now(), prev.speed));
    }
    const next = { ...prev, ...patch };
    settingsRef.current = next;
    setSettings(next);
    void saveSettings(next);
  }, []);

  // --- Estrategia y paso actual ---
  const strategy = BUNDLED_STRATEGIES.find((s) => s.id === settings.selection.strategyId);
  const times = useMemo(
    () => (strategy ? estimateStepTimes(strategy.build_order) : []),
    [strategy],
  );
  const gameSeconds = clock.gameTime(clockState, now, settings.speed);
  const position = getStepAt(times, gameSeconds);

  // Refresca el reloj mientras corre.
  useEffect(() => {
    if (!clockState.running) return;
    const id = setInterval(() => setNow(performance.now()), 200);
    return () => clearInterval(id);
  }, [clockState.running]);

  // Aviso al cambiar de paso.
  const lastIndex = useRef(position.index);
  useEffect(() => {
    if (position.index === lastIndex.current) return;
    lastIndex.current = position.index;
    setFlash(true);
    if (settings.sound) beep();
    const id = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(id);
  }, [position.index, settings.sound]);

  // --- Modo juego / edición ---
  useEffect(() => {
    void setGameMode(mode === "game");
  }, [mode]);

  const toggleMode = useCallback(() => setMode((m) => (m === "edit" ? "game" : "edit")), []);
  useEffect(() => {
    const off = onTrayToggleMode(toggleMode);
    return () => void off.then((fn) => fn());
  }, [toggleMode]);

  // --- Hotkeys globales ---
  // Los handlers leen el estado más reciente a través de una ref.
  const actions = useRef<Record<HotkeyAction, () => void>>(null!);
  actions.current = {
    toggleMode,
    toggleVisible: () => void toggleVisibility(),
    startPause: () => {
      const t = performance.now();
      setNow(t);
      setClockState((c) => clock.toggle(c, t));
    },
    reset: () => setClockState(clock.reset()),
    plus5: () => setClockState((c) => clock.shift(c, performance.now(), settings.speed, 5)),
    minus5: () => setClockState((c) => clock.shift(c, performance.now(), settings.speed, -5)),
    nextStep: () => {
      if (position.nextIndex === null) return;
      const target = times[position.nextIndex]!;
      setClockState((c) => clock.jumpTo(c, performance.now(), settings.speed, target));
    },
    prevStep: () => {
      const target = times[Math.max(0, position.index - 1)] ?? 0;
      setClockState((c) => clock.jumpTo(c, performance.now(), settings.speed, target));
    },
  };
  // Cualquier cambio de estado del reloj tiene que verse ya, aunque esté pausado.
  useEffect(() => {
    setNow(performance.now());
  }, [clockState]);

  useEffect(() => {
    let cancelled = false;
    void registerHotkeys(settings.hotkeys, (action) => actions.current[action]()).then(
      (errors) => !cancelled && setHotkeyErrors(errors),
    );
    return () => {
      cancelled = true;
    };
  }, [settings.hotkeys]);

  const play = () => {
    setClockState(clock.reset());
    setMode("game");
  };

  const style = {
    "--bg-opacity": settings.opacity,
    zoom: settings.scale,
  } as CSSProperties;

  return (
    <main className={`panel mode-${mode}`} style={style}>
      {mode === "edit" && (
        <>
          <header className="titlebar" data-tauri-drag-region>
            <span data-tauri-drag-region>AoE2 Overlay</span>
            <nav>
              <button className={tab === "match" ? "active" : ""} onClick={() => setTab("match")}>
                Partida
              </button>
              <button
                className={tab === "settings" ? "active" : ""}
                onClick={() => setTab("settings")}
              >
                Ajustes
              </button>
              {isTauri() && (
                <button title="Ocultar" onClick={() => void toggleVisibility()}>
                  ✕
                </button>
              )}
            </nav>
          </header>
          <div className="content">
            {tab === "match" ? (
              <SetupView
                selection={settings.selection}
                onChange={(selection) => updateSettings({ selection })}
                onPlay={play}
              />
            ) : (
              <SettingsView
                settings={settings}
                hotkeyErrors={hotkeyErrors}
                onChange={updateSettings}
                onResetPosition={() => void resetPosition()}
              />
            )}
          </div>
          <footer className="footer muted">
            {settings.hotkeys.toggleMode}: modo juego · {settings.hotkeys.toggleVisible}: ocultar
          </footer>
        </>
      )}
      {mode === "game" && (
        <GameView
          strategy={strategy}
          position={position}
          gameSeconds={gameSeconds}
          running={clockState.running}
          flash={flash}
          settings={settings}
        />
      )}
    </main>
  );
}
