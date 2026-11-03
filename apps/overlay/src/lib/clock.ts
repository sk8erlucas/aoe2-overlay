/**
 * Reloj de partida. Estado inmutable + funciones puras para poder testearlo.
 *
 * El tiempo real transcurrido se convierte a tiempo de juego con la velocidad de la partida.
 * `offset` (en segundos de juego) acumula los ajustes manuales (±5 s, saltar de paso).
 */
import { realToGame } from "@age-overlay/shared";

export interface ClockState {
  running: boolean;
  /** performance.now() al último arranque, o null si está pausado. */
  startedAt: number | null;
  /** Milisegundos reales acumulados antes del último arranque. */
  elapsedMs: number;
  /** Ajuste manual en segundos de juego. */
  offset: number;
}

export const initialClock: ClockState = {
  running: false,
  startedAt: null,
  elapsedMs: 0,
  offset: 0,
};

function elapsedRealMs(state: ClockState, now: number): number {
  return state.elapsedMs + (state.running && state.startedAt !== null ? now - state.startedAt : 0);
}

/** Tiempo de juego actual en segundos (nunca negativo). */
export function gameTime(state: ClockState, now: number, speed: number): number {
  return Math.max(0, realToGame(elapsedRealMs(state, now) / 1000, speed) + state.offset);
}

export function start(state: ClockState, now: number): ClockState {
  if (state.running) return state;
  return { ...state, running: true, startedAt: now };
}

export function pause(state: ClockState, now: number): ClockState {
  if (!state.running) return state;
  return { ...state, running: false, startedAt: null, elapsedMs: elapsedRealMs(state, now) };
}

export function toggle(state: ClockState, now: number): ClockState {
  return state.running ? pause(state, now) : start(state, now);
}

export function reset(): ClockState {
  return initialClock;
}

/** Suma (o resta) segundos de juego. No deja que el reloj quede por debajo de 0. */
export function shift(state: ClockState, now: number, speed: number, seconds: number): ClockState {
  const current = gameTime(state, now, speed);
  const delta = Math.max(-current, seconds);
  return { ...state, offset: state.offset + delta };
}

/** Lleva el reloj exactamente a `target` segundos de juego. */
export function jumpTo(state: ClockState, now: number, speed: number, target: number): ClockState {
  return shift(state, now, speed, Math.max(0, target) - gameTime(state, now, speed));
}

/**
 * Cambia la velocidad sin que el reloj salte: el tiempo ya transcurrido se congela en el
 * offset y se sigue contando desde ahora con la nueva velocidad.
 */
export function rebase(state: ClockState, now: number, oldSpeed: number): ClockState {
  return {
    running: state.running,
    startedAt: state.running ? now : null,
    elapsedMs: 0,
    offset: gameTime(state, now, oldSpeed),
  };
}
