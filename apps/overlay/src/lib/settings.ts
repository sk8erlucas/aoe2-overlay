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

export interface Settings {
  speed: number;
  /** Opacidad del fondo del panel (0.2 – 1). */
  opacity: number;
  /** Escala del texto (0.8 – 1.5). */
  scale: number;
  sound: boolean;
  hotkeys: Record<HotkeyAction, string>;
  selection: Selection;
}

export const DEFAULT_SETTINGS: Settings = {
  speed: DEFAULT_SPEED,
  opacity: 0.75,
  scale: 1,
  sound: false,
  hotkeys: DEFAULT_HOTKEYS,
  selection: {},
};

const KEY = "settings";
const FALLBACK_KEY = "aoe2-overlay:settings";

function merge(saved: Partial<Settings> | null | undefined): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    hotkeys: { ...DEFAULT_HOTKEYS, ...saved?.hotkeys },
    selection: { ...saved?.selection },
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
