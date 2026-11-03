import type { Step } from "./schema";

/** Velocidad "Normal" de AoE2 DE. */
export const DEFAULT_SPEED = 1.7;

/** Segundos de juego para entrenar un aldeano. */
export const VILLAGER_TRAIN_TIME = 25;
/** Aldeanos con los que se empieza una partida estándar. */
export const STARTING_VILLAGERS = 3;
/** Segundos de juego para avanzar A esa edad (sin bonus de civilización). */
export const AGE_UP_TIME: Record<number, number> = { 2: 130, 3: 160, 4: 190 };

/** Convierte segundos de juego a segundos reales según la velocidad de la partida. */
export function gameToReal(gameSeconds: number, speed = DEFAULT_SPEED): number {
  return gameSeconds / speed;
}

/** Convierte segundos reales a segundos de juego según la velocidad de la partida. */
export function realToGame(realSeconds: number, speed = DEFAULT_SPEED): number {
  return realSeconds * speed;
}

/** 125 → "2:05". Negativos se muestran como 0:00. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "2:05" → 125. Lanza error si el formato es inválido. */
export function parseClock(value: string): number {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
  if (!match) throw new Error(`Formato de tiempo inválido: "${value}" (se espera m:ss)`);
  return Number(match[1]) * 60 + Number(match[2]);
}

function explicitTime(step: Step): number | undefined {
  if (step.time === undefined) return undefined;
  return typeof step.time === "number" ? step.time : parseClock(step.time);
}

/**
 * Estima el tiempo de juego (segundos) en que ocurre cada paso.
 *
 * - Si el paso tiene `time`, se usa ese valor.
 * - Si no: un aldeano cada 25 s desde los 3 iniciales, más el tiempo de cada avance de edad
 *   ya iniciado (mientras se avanza de edad el centro urbano no produce aldeanos).
 * - El resultado nunca retrocede: cada paso ocurre igual o después que el anterior.
 */
export function estimateStepTimes(steps: readonly Step[]): number[] {
  const times: number[] = [];
  let currentAge = 1;
  let ageDelay = 0;
  let previous = 0;

  for (const step of steps) {
    while (currentAge < step.age) {
      currentAge += 1;
      ageDelay += AGE_UP_TIME[currentAge] ?? 0;
    }
    const estimated =
      Math.max(0, step.villager_count - STARTING_VILLAGERS) * VILLAGER_TRAIN_TIME + ageDelay;
    const time = Math.max(previous, explicitTime(step) ?? estimated);
    times.push(time);
    previous = time;
  }
  return times;
}

export interface StepPosition {
  /** Índice del paso actual (0 antes de que arranque el primero). */
  index: number;
  /** Índice del siguiente paso, o null si es el último. */
  nextIndex: number | null;
  /** Segundos de juego hasta el siguiente paso, o null si es el último. */
  secondsToNext: number | null;
}

/** Dado el tiempo de juego actual, devuelve el paso actual y cuánto falta para el siguiente. */
export function getStepAt(stepTimes: readonly number[], gameSeconds: number): StepPosition {
  let index = 0;
  for (let i = 0; i < stepTimes.length; i++) {
    if ((stepTimes[i] ?? Infinity) <= gameSeconds) index = i;
    else break;
  }
  const nextIndex = index + 1 < stepTimes.length ? index + 1 : null;
  const secondsToNext =
    nextIndex === null ? null : Math.max(0, (stepTimes[nextIndex] ?? 0) - gameSeconds);
  return { index, nextIndex, secondsToNext };
}
