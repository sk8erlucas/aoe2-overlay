import type { MapType, Position, Strategy } from "./schema";
import { getCivilizations, sameName } from "./schema";

/** Lo que el jugador elige antes de la partida. Todo opcional. */
export interface SuggestionContext {
  /** Civ propia (nombre en inglés, p. ej. "Malay"). */
  civ?: string;
  /** Civ rival. */
  vsCiv?: string;
  /** Id del mapa (p. ej. "black_forest"). */
  map?: string;
  /** Tipo del mapa. Si se conoce el mapa, conviene pasarlo (ver game-data). */
  mapType?: MapType;
  position?: Position;
}

export const SCORE = {
  civExact: 50,
  civGeneric: 10,
  mapExact: 30,
  mapType: 20,
  vsCiv: 15,
  position: 10,
  positionMismatch: -10,
  /** Multiplicador sobre log10(1 + votos). */
  votes: 5,
} as const;

export interface ScoreResult {
  score: number;
  reasons: string[];
}

const includesName = (list: readonly string[] | undefined, value: string) =>
  !!list?.some((item) => sameName(item, value));

/**
 * Puntúa una estrategia para un contexto. Devuelve `null` si la estrategia no aplica
 * (por ejemplo, es de otra civ o es para un tipo de mapa distinto).
 */
export function scoreStrategy(
  strategy: Strategy,
  ctx: SuggestionContext,
  votes = 0,
): ScoreResult | null {
  let score = 0;
  const reasons: string[] = [];

  // Civilización
  const civs = getCivilizations(strategy);
  if (civs.length === 0) {
    score += SCORE.civGeneric;
    reasons.push("genérica");
  } else if (ctx.civ) {
    if (!includesName(civs, ctx.civ)) return null;
    score += SCORE.civExact;
    reasons.push("civ");
  }

  // Mapa
  const mapMatch = !!ctx.map && includesName(strategy.maps, ctx.map);
  if (mapMatch) {
    score += SCORE.mapExact;
    reasons.push("mapa");
  }
  if (ctx.mapType && strategy.map_types?.length) {
    if (strategy.map_types.includes(ctx.mapType)) {
      score += SCORE.mapType;
      reasons.push("tipo de mapa");
    } else if (!mapMatch) {
      return null;
    }
  }

  // Rival
  if (ctx.vsCiv && includesName(strategy.vs_civilizations, ctx.vsCiv)) {
    score += SCORE.vsCiv;
    reasons.push("rival");
  }

  // Posición
  if (ctx.position && strategy.positions?.length) {
    if (strategy.positions.includes(ctx.position)) {
      score += SCORE.position;
      reasons.push("posición");
    } else {
      score += SCORE.positionMismatch;
    }
  }

  // Votos de la comunidad
  if (votes > 0) score += Math.log10(1 + votes) * SCORE.votes;

  return { score, reasons };
}

export interface Suggestion<T extends Strategy> extends ScoreResult {
  strategy: T;
}

export interface SuggestOptions<T> {
  limit?: number;
  getVotes?: (strategy: T) => number;
}

/** Devuelve las estrategias aplicables, ordenadas de mejor a peor. */
export function suggest<T extends Strategy>(
  strategies: readonly T[],
  ctx: SuggestionContext,
  { limit = 10, getVotes }: SuggestOptions<T> = {},
): Suggestion<T>[] {
  return strategies
    .flatMap((strategy) => {
      const result = scoreStrategy(strategy, ctx, getVotes?.(strategy) ?? 0);
      return result ? [{ strategy, ...result }] : [];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
