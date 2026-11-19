import { DEFAULT_SPEED, type Position } from "@age-overlay/shared";
import { isTauri } from "@tauri-apps/api/core";

export const HOTKEY_ACTIONS = [
  "toggleMode",
  "startPause",
  "reset",
  "plus5",
  "minus5",
  "nextStep",
  "prevStep",
  "toggleVisible",
] as const;
export type HotkeyAction = (typeof HOTKEY_ACTIONS)[number];

export const HOTKEY_LABELS: Record<HotkeyAction, string> = {
  toggleMode: "Modo edición / juego",
  startPause: "Iniciar / pausar reloj",
  reset: "Reiniciar reloj",
  plus5: "Adelantar 5 s",
  minus5: "Atrasar 5 s",
  nextStep: "Paso siguiente",
  prevStep: "Paso anterior",
  toggleVisible: "Mostrar / ocultar",
};

/** Con Ctrl+Alt se evita chocar con los atajos del juego. */
export const DEFAULT_HOTKEYS: Record<HotkeyAction, string> = {
  toggleMode: "Control+Alt+O",
  startPause: "Control+Alt+P",
  reset: "Control+Alt+R",
  plus5: "Control+Alt+L",
  minus5: "Control+Alt+J",
  nextStep: "Control+Alt+PageDown",
  prevStep: "Control+Alt+PageUp",
  toggleVisible: "Control+Alt+H",
};

export interface Selection {
  civ?: string;
  vsCiv?: string;
  map?: string;
  position?: Position;
  strategyId?: string;
}

export const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
export type Corner = (typeof CORNERS)[number];

export const CORNER_LABELS: Record<Corner, string> = {
  "top-right": "Arriba a la derecha",
  "top-left": "Arriba a la izquierda",
  "bottom-right": "Abajo a la derecha",
  "bottom-left": "Abajo a la izquierda",
};

/** Cuánta información muestra el overlay durante la partida. */
export const LAYOUTS = ["normal", "compact", "detailed"] as const;
export type Layout = (typeof LAYOUTS)[number];

export const LAYOUT_LABELS: Record<Layout, string> = {
  normal: "Normal: paso actual y siguiente",
  compact: "Compacto: solo el paso actual",
  detailed: "Detallado: nombre y los próximos 3 pasos",
};

export interface Settings {
  speed: number;
  /** Opacidad del fondo del panel (0.2 – 1). */
  opacity: number;
  /** Escala del texto (0.8 – 1.5). */
  scale: number;
  sound: boolean;
  hotkeys: Record<HotkeyAction, string>;
  selection: Selection;
  corner: Corner;
  /** Índice del monitor; sin valor, el principal. */
  monitor?: number;
  layout: Layout;
  /** Detección automática con AoE2 Companion (ver lib/detect.ts). */
  detect: DetectSettings;
}

export interface DetectSettings {
  /** Id de perfil del jugador en AoE2 Companion; sin él, no se detecta nada. */
  profileId?: number;
  profileName?: string;
  /** Al detectar una partida, arrancar el reloj y pasar a modo juego. */
  autoStart: boolean;
  /** Al terminar, reportar si se ganó (necesita cuenta). */
  autoReport: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  speed: DEFAULT_SPEED,
  opacity: 0.75,
  scale: 1,
  sound: false,
  hotkeys: DEFAULT_HOTKEYS,
  selection: {},
  corner: "top-right",
  layout: "normal",
  detect: { autoStart: true, autoReport: true },
};

const KEY = "settings";
const FALLBACK_KEY = "aoe2-overlay:settings";

function merge(saved: (Partial<Settings> & { apiUrl?: unknown }) | null | undefined): Settings {
  // `apiUrl` existió hasta la 0.3.1 y ya no se usa: no se arrastra a lo guardado.
  const { apiUrl: _removed, ...rest } = saved ?? {};
  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    hotkeys: { ...DEFAULT_HOTKEYS, ...saved?.hotkeys },
    selection: { ...saved?.selection },
    detect: { ...DEFAULT_SETTINGS.detect, ...saved?.detect },
  };
}

async function tauriStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load("settings.json", { defaults: {}, autoSave: 300 });
}

/** Lee la configuración (store de Tauri, o localStorage si se corre en el navegador). */
export async function loadSettings(): Promise<Settings> {
  try {
    if (isTauri()) {
      const store = await tauriStore();
      return merge(await store.get<Partial<Settings>>(KEY));
    }
    const raw = localStorage.getItem(FALLBACK_KEY);
    return merge(raw ? (JSON.parse(raw) as Partial<Settings>) : null);
  } catch (e) {
    console.warn("No se pudo leer la configuración, se usan valores por defecto", e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    if (isTauri()) {
      const store = await tauriStore();
      await store.set(KEY, settings);
    } else {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(settings));
    }
  } catch (e) {
    console.warn("No se pudo guardar la configuración", e);
  }
}
