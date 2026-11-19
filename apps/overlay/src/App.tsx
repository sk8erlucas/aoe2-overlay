import { estimateStepTimes, getStepAt } from "@age-overlay/shared";
import { isTauri } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AccountAvatar } from "./components/AccountAvatar";
import { GameView } from "./components/GameView";
import { SettingsView } from "./components/SettingsView";
import { SetupView } from "./components/SetupView";
import {
  fetchFavorites,
  loadAccount,
  reportResult,
  saveAccount,
  setFavorite,
  signOut,
  type Account,
} from "./lib/account";
import * as clock from "./lib/clock";
import { onDeepLink, type DeepLink } from "./lib/deeplink";
import {
  chooseStrategy,
  DETECT_INTERVAL_MS,
  elapsedGameSeconds,
  fetchLatestMatch,
  isOngoing,
  type DetectedMatch,
} from "./lib/detect";
import { checkForUpdate, UPDATE_CHECK_INTERVAL_MS, type AvailableUpdate } from "./lib/updater";
import {
  beep,
  onTrayToggleMode,
  quitApp,
  registerHotkeys,
  resetPosition,
  setGameMode,
  setPlacement,
  showOverlay,
  toggleVisibility,
  type HotkeyError,
} from "./lib/native";
import { loadSettings, saveSettings, type HotkeyAction, type Settings } from "./lib/settings";
import {
  loadCache,
  API_URL,
  mergeStrategies,
  syncStrategies,
  type RemoteItem,
  SYNC_INTERVAL_MS,
  type StrategyCache,
  type SyncStatus,
} from "./lib/sync";

type Mode = "edit" | "game";

/** Línea de estado de la detección automática para la pestaña Partida. */
function detectLine(
  settings: Settings,
  match: DetectedMatch | null,
  lastResult: { won: boolean; reported: boolean } | null,
): string | null {
  const name = settings.detect.profileName ?? "tu perfil";
  if (!settings.detect.profileId) return null;
  if (lastResult) {
    return `${lastResult.won ? "🏆 Victoria" : "Derrota"} en la última partida${lastResult.reported ? " · reportada" : ""}`;
  }
  if (match && isOngoing(match)) {
    const vs = match.vsCiv ? ` vs ${match.vsCiv}` : "";
    return `🎮 Partida en curso${match.civ ? `: ${match.civ}${vs}` : ""}`;
  }
  return `🔎 Esperando la próxima partida de ${name}`;
}
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

  // --- Esquina y monitor: al arrancar solo se informan (la ventana recuerda dónde quedó);
  // si el usuario los cambia en Ajustes, se mueve ahí. ---
  const placedOnce = useRef(false);
  useEffect(() => {
    void setPlacement(settings.corner, settings.monitor, placedOnce.current);
    placedOnce.current = true;
  }, [settings.corner, settings.monitor]);

  // --- Estrategias: base + descargadas de la API (con caché offline) ---
  const [cache, setCache] = useState<StrategyCache | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle" });
  // Estrategias abiertas desde un link que no venían en la sincronización (p. ej. no listadas).
  const [extra, setExtra] = useState<RemoteItem[]>([]);
  const strategies = useMemo(
    () => mergeStrategies([...(cache?.items ?? []), ...extra]),
    [cache, extra],
  );
  const strategiesRef = useRef(strategies);
  strategiesRef.current = strategies;

  // --- Cuenta (opcional) y favoritas ---
  const [account, setAccount] = useState<Account | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const accountRef = useRef<Account | null>(null);
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  /** Sesión vencida o cerrada desde la web. */
  const forgetAccount = useCallback(async () => {
    accountRef.current = null;
    setAccount(null);
    setFavorites([]);
    await saveAccount(null);
  }, []);

  const refreshFavorites = useCallback(async () => {
    const acc = accountRef.current;
    if (!acc) {
      setFavorites([]);
      return;
    }
    try {
      const favs = await fetchFavorites(acc);
      if (favs === null) {
        await forgetAccount();
      } else {
        setFavorites(favs);
      }
    } catch {
      // Sin conexión: se mantienen las que había.
    }
  }, [forgetAccount]);

  const toggleFavorite = useCallback(
    async (slug: string) => {
      const acc = accountRef.current;
      if (!acc) {
        setTab("settings");
        return;
      }
      const was = favoritesRef.current.includes(slug);
      const apply = (on: boolean) =>
        setFavorites((prev) => {
          const rest = prev.filter((s) => s !== slug);
          return on ? [slug, ...rest] : rest;
        });
      apply(!was); // Se ve al instante; si la API falla, se vuelve atrás.
      try {
        if (!(await setFavorite(acc, slug, !was))) await forgetAccount();
      } catch {
        apply(was);
      }
    },
    [forgetAccount],
  );

  const login = useCallback(
    async (acc: Account) => {
      accountRef.current = acc;
      setAccount(acc);
      await saveAccount(acc);
      await refreshFavorites();
    },
    [refreshFavorites],
  );

  const logout = useCallback(async () => {
    const acc = accountRef.current;
    accountRef.current = null;
    setAccount(null);
    setFavorites([]);
    await saveAccount(null);
    if (acc) await signOut(acc);
  }, []);

  const cacheRef = useRef<StrategyCache | null>(null);
  const runSync = useCallback(async () => {
    void refreshFavorites();
    setSyncStatus({ state: "syncing" });
    try {
      const next = await syncStrategies(API_URL, cacheRef.current);
      cacheRef.current = next;
      setCache(next);
      setSyncStatus({ state: "ok", syncedAt: next.syncedAt, count: next.items.length });
    } catch (e) {
      setSyncStatus({
        state: "offline",
        message: e instanceof Error ? e.message : String(e),
        syncedAt: cacheRef.current?.syncedAt ?? null,
      });
    }
  }, []);

  // Al abrir: primero la caché y la cuenta (funciona sin internet), después sincroniza.
  useEffect(() => {
    void Promise.all([loadCache(), loadAccount()]).then(([saved, acc]) => {
      cacheRef.current = saved;
      setCache(saved);
      accountRef.current = acc;
      setAccount(acc);
      void runSync();
    });
    const id = setInterval(() => void runSync(), SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [runSync]);

  // --- Actualizaciones: al rato de abrir y cada 6 h (se avisa en Ajustes) ---
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);
  useEffect(() => {
    const run = () => void checkForUpdate().then((u) => u && setUpdate(u));
    const first = setTimeout(run, 10_000);
    const id = setInterval(run, UPDATE_CHECK_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  // --- Links desde la web: ageoverlay://strategy/<slug> ---
  const openLink = useCallback(
    async (link: DeepLink) => {
      setMode("edit");
      setTab("match");
      const select = () =>
        updateSettings({
          selection: { ...settingsRef.current.selection, strategyId: link.slug },
        });
      if (strategiesRef.current.some((s) => s.id === link.slug)) return select();
      try {
        const res = await fetch(`${API_URL}/api/strategies/${encodeURIComponent(link.slug)}`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) return;
        const item = (await res.json()) as RemoteItem;
        setExtra((prev) => [...prev.filter((i) => i.slug !== item.slug), item]);
        select();
      } catch {
        // Sin conexión y sin la estrategia en caché: no se puede abrir.
      }
    },
    [updateSettings],
  );
  useEffect(() => {
    const off = onDeepLink((link) => void openLink(link));
    return () => void off.then((fn) => fn());
  }, [openLink]);

  // --- Estrategia y paso actual ---
  const strategy = strategies.find((s) => s.id === settings.selection.strategyId);
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

  // --- Detección automática de la partida (AoE2 Companion) ---
  const [detected, setDetected] = useState<DetectedMatch | null>(null);
  /** Resultado de la última partida jugada con el overlay (se muestra en Partida). */
  const [lastResult, setLastResult] = useState<{ won: boolean; reported: boolean } | null>(null);
  const handledMatch = useRef<number | null>(null);
  /** Partida que se está jugando con una estrategia: para reportar el resultado al terminar. */
  const playing = useRef<{ matchId: number; slug: string; done: boolean } | null>(null);

  useEffect(() => {
    const profileId = settings.detect.profileId;
    if (!profileId) {
      setDetected(null);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      let match: DetectedMatch | null;
      try {
        match = await fetchLatestMatch(profileId);
      } catch {
        return; // Sin conexión o la API no responde: se reintenta en el próximo ciclo.
      }
      if (cancelled || !match) return;
      setDetected(match);
      const s = settingsRef.current;

      // Empezó una partida nueva: elegir filtros y estrategia, y arrancar el reloj.
      if (isOngoing(match) && handledMatch.current !== match.matchId) {
        handledMatch.current = match.matchId;
        setLastResult(null);
        const speed = match.speed ?? s.speed;
        const strategyId = chooseStrategy(
          strategiesRef.current,
          match,
          s.selection.strategyId,
          favoritesRef.current,
        );
        updateSettings({
          selection: {
            civ: match.civ,
            vsCiv: match.vsCiv,
            map: match.map,
            position: match.position,
            strategyId,
          },
          speed,
        });
        playing.current = strategyId
          ? { matchId: match.matchId, slug: strategyId, done: false }
          : null;
        if (s.detect.autoStart && strategyId) {
          const t = performance.now();
          setClockState(
            clock.jumpTo(clock.start(clock.reset(), t), t, speed, elapsedGameSeconds(match, speed)),
          );
          setMode("game");
        }
      }

      // Terminó la partida que se jugaba: pausar y reportar el resultado.
      const current = playing.current;
      if (match.finished && current?.matchId === match.matchId && !current.done) {
        current.done = true;
        setClockState((c) => clock.pause(c, performance.now()));
        if (match.won === undefined) return;
        const acc = accountRef.current;
        let reported = false;
        if (s.detect.autoReport && acc) {
          try {
            reported = await reportResult(acc, current.slug, match.won, String(match.matchId));
          } catch {
            // Sin conexión: no se reporta (la partida ya no se vuelve a ofrecer).
          }
        }
        setLastResult({ won: match.won, reported });
      }
    };
    void tick();
    const id = setInterval(() => void tick(), DETECT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [settings.detect.profileId, updateSettings]);

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
                title={update ? `Versión ${update.version} disponible` : undefined}
              >
                Ajustes{update && <span className="dot" aria-label="actualización disponible" />}
              </button>
              <AccountAvatar account={account} onClick={() => setTab("settings")} />
              {isTauri() && (
                <button title="Ocultar" onClick={() => void toggleVisibility()}>
                  ✕
                </button>
              )}
            </nav>
          </header>
          <div className="content">
            {tab === "match" && (
              <SetupView
                strategies={strategies}
                favorites={favorites}
                loggedIn={!!account}
                onToggleFavorite={(slug) => void toggleFavorite(slug)}
                syncStatus={syncStatus}
                selection={settings.selection}
                onChange={(selection) => updateSettings({ selection })}
                onPlay={play}
                detectLine={detectLine(settings, detected, lastResult)}
              />
            )}
            {/* Siempre montado: el login sigue esperando aunque se cambie de pestaña. */}
            <div hidden={tab !== "settings"}>
              <SettingsView
                settings={settings}
                hotkeyErrors={hotkeyErrors}
                onChange={updateSettings}
                onResetPosition={() => void resetPosition()}
                onSyncNow={() => void runSync()}
                account={account}
                onLogin={login}
                onLogout={() => void logout()}
                update={update}
                onQuit={() => void quitApp()}
              />
            </div>
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
          onAction={(action) =>
            action === "hide" ? void toggleVisibility() : actions.current[action]()
          }
        />
      )}
    </main>
  );
}
