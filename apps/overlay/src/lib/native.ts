/**
 * Llamadas a la parte nativa (Rust). Si la app corre en un navegador común
 * (pnpm vite:dev, para diseñar la UI) no hacen nada.
 */
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { HotkeyAction } from "./settings";

export async function setGameMode(enabled: boolean): Promise<void> {
  if (isTauri()) await invoke("set_game_mode", { enabled });
}

export async function showOverlay(): Promise<void> {
  if (isTauri()) await invoke("show_overlay");
}

export async function toggleVisibility(): Promise<void> {
  if (isTauri()) await invoke("toggle_visibility");
}

export async function resetPosition(): Promise<void> {
  if (isTauri()) await invoke("reset_position");
}

/** Evento que emite el menú de la bandeja del sistema. */
export async function onTrayToggleMode(handler: () => void): Promise<UnlistenFn> {
  if (!isTauri()) return () => {};
  return listen("overlay://toggle-mode", handler);
}

export interface HotkeyError {
  action: HotkeyAction;
  shortcut: string;
  message: string;
}

/**
 * Registra las hotkeys globales (funcionan aunque el juego tenga el foco).
 * Devuelve las que no se pudieron registrar (formato inválido o en uso por otra app).
 */
export async function registerHotkeys(
  hotkeys: Record<HotkeyAction, string>,
  onAction: (action: HotkeyAction) => void,
): Promise<HotkeyError[]> {
  if (!isTauri()) return [];
  const { register, unregisterAll } = await import("@tauri-apps/plugin-global-shortcut");
  await unregisterAll();
  const errors: HotkeyError[] = [];
  for (const [action, shortcut] of Object.entries(hotkeys) as [HotkeyAction, string][]) {
    if (!shortcut.trim()) continue;
    try {
      await register(shortcut, (event) => {
        if (event.state === "Pressed") onAction(action);
      });
    } catch (e) {
      errors.push({ action, shortcut, message: String(e) });
    }
  }
  return errors;
}

/** Bip corto al cambiar de paso (opcional). */
export function beep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => void ctx.close();
  } catch {
    // Sin audio disponible: no pasa nada.
  }
}
