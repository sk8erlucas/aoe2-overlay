/**
 * Detección automática de la partida con la API pública de AoE2 Companion
 * (https://www.aoe2companion.com). El overlay sigue sin leer nada del juego: solo consulta
 * el historial público del jugador por su id de perfil.
 *
 * - Una partida sin `finished` y que empezó hace poco es la que se está jugando.
 * - De ahí salen el mapa, la civ propia, la del rival, la posición y la velocidad.
 * - Cuando la partida termina, `won` dice si se ganó (sirve para reportar el resultado).
 */
import { CIVS, MAPS, mapTypeOf } from "@age-overlay/game-data";
import { suggest, type Position } from "@age-overlay/shared";
import type { LoadedStrategy } from "./strategies";

export const COMPANION_API = "https://data.aoe2companion.com/api";
/** Cada cuánto se consulta mientras la detección está activa. */
export const DETECT_INTERVAL_MS = 20_000;
/** Una partida "en curso" que empezó hace más que esto se ignora (quedó colgada en la API). */
const MAX_MATCH_AGE_MS = 3 * 60 * 60 * 1000;

export interface CompanionPlayer {
  profileId: number;
  name: string;
  civ: string;
  civName?: string;
  team?: number | null;
  won?: boolean | null;
}

export interface CompanionMatch {
  matchId: number;
  started: string | null;
  finished: string | null;
  map?: string;
  mapName?: string;
  speedFactor?: number;
  teams: { teamId: number; players: CompanionPlayer[] }[];
}

export interface DetectedMatch {
  matchId: number;
  /** Momento en que empezó (ms desde epoch). */
  startedAt: number;
  finished: boolean;
  /** Solo si terminó y la API lo sabe. */
  won?: boolean;
  speed?: number;
  /** Nombre en inglés, como en las estrategias. */
  civ?: string;
  vsCiv?: string;
  map?: string;
  position?: Position;
}

export interface CompanionProfile {
  profileId: number;
  name: string;
  country?: string | null;
  games?: string | number | null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "hindustanis" / "Hindustanis" → "Hindustanis" (nombre en inglés de game-data). */
export function civFromCompanion(civ: string, civName?: string): string | undefined {
  const keys = [civ, civName].filter(Boolean).map((k) => norm(k!));
  return CIVS.find((c) => keys.includes(norm(c.id)) || keys.includes(norm(c.name.en)))?.name.en;
}

/** "rm_arabia" / "Arabia" → "arabia" (id de game-data). Los mapas que no conocemos, undefined. */
export function mapFromCompanion(map?: string, mapName?: string): string | undefined {
  const keys = [map?.replace(/^rm_/, ""), mapName?.replace(/\(.*\)/, "")]
    .filter(Boolean)
    .map((k) => norm(k!));
  return MAPS.find((m) => keys.includes(norm(m.id)) || keys.includes(norm(m.name.en)))?.id;
}

/** Arma la partida detectada desde el punto de vista de `profileId`. */
export function parseMatch(match: CompanionMatch, profileId: number): DetectedMatch | null {
  if (!match.started) return null;
  const players = match.teams.flatMap((t) =>
    t.players.map((p) => ({ ...p, team: p.team ?? t.teamId })),
  );
  const me = players.find((p) => p.profileId === profileId);
  if (!me) return null;
  const rivals = players.filter((p) => p.team !== me.team);
  const allies = players.filter((p) => p.team === me.team);
  const rival = rivals[0];
  return {
    matchId: match.matchId,
    startedAt: new Date(match.started).getTime(),
    finished: !!match.finished,
    won: match.finished && typeof me.won === "boolean" ? me.won : undefined,
    speed: match.speedFactor,
    civ: civFromCompanion(me.civ, me.civName),
    vsCiv: rival ? civFromCompanion(rival.civ, rival.civName) : undefined,
    map: mapFromCompanion(match.map, match.mapName),
    // En equipos no se sabe si es flanco o bolsillo: se deja sin elegir.
    position: allies.length === 1 && rivals.length === 1 ? "1v1" : undefined,
  };
}

/** ¿Es una partida que se está jugando ahora? */
export function isOngoing(match: DetectedMatch, now = Date.now()): boolean {
  return !match.finished && now - match.startedAt < MAX_MATCH_AGE_MS;
}

/** Última partida del jugador (en curso o terminada), o null si no hay. */
export async function fetchLatestMatch(profileId: number): Promise<DetectedMatch | null> {
  const res = await fetch(`${COMPANION_API}/matches?profile_ids=${profileId}&page=1`);
  if (!res.ok) throw new Error(`AoE2 Companion respondió ${res.status}`);
  const body = (await res.json()) as { matches?: CompanionMatch[] };
  const latest = body.matches?.[0];
  return latest ? parseMatch(latest, profileId) : null;
}

/** Busca perfiles por nombre, para que el usuario elija el suyo. */
export async function searchProfiles(name: string): Promise<CompanionProfile[]> {
  const res = await fetch(
    `${COMPANION_API}/profiles?search=${encodeURIComponent(name.trim())}&page=1`,
  );
  if (!res.ok) throw new Error(`AoE2 Companion respondió ${res.status}`);
  const body = (await res.json()) as { profiles?: CompanionProfile[] };
  return (body.profiles ?? []).slice(0, 10);
}

/**
 * Estrategia para la partida detectada: se mantiene la elegida si sigue siendo sugerida
 * para esa civ y mapa; si no, la mejor sugerencia (favoritas primero).
 */
export function chooseStrategy(
  strategies: readonly LoadedStrategy[],
  match: DetectedMatch,
  currentId: string | undefined,
  favorites: readonly string[] = [],
): string | undefined {
  const results = suggest(
    strategies,
    {
      civ: match.civ,
      vsCiv: match.vsCiv,
      map: match.map,
      mapType: match.map ? mapTypeOf(match.map) : undefined,
      position: match.position,
    },
    { limit: strategies.length, getVotes: (s) => s.score ?? 0 },
  );
  if (currentId && results.some((r) => r.strategy.id === currentId)) return currentId;
  const fav = results.find((r) => favorites.includes(r.strategy.id));
  return (fav ?? results[0])?.strategy.id;
}

/** Segundos de juego transcurridos desde que empezó la partida. */
export function elapsedGameSeconds(match: DetectedMatch, speed: number, now = Date.now()): number {
  return Math.max(0, ((now - match.startedAt) / 1000) * (match.speed ?? speed));
}
