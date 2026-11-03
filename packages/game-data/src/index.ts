import type { MapType } from "@age-overlay/shared";
import { CIVS, type Civ } from "./civs";
import { MAPS, type GameMap } from "./maps";

export { CIVS, MAPS };
export type { Civ, GameMap };
export type { LocalizedName, Locale } from "./types";

export type CivId = (typeof CIVS)[number]["id"];
export type MapId = (typeof MAPS)[number]["id"];

const norm = (s: string) => s.trim().toLowerCase();

/** Busca una civ por id o por nombre (inglés o español), sin importar mayúsculas. */
export function findCiv(idOrName: string): Civ | undefined {
  const key = norm(idOrName);
  return CIVS.find((c) => c.id === key || norm(c.name.en) === key || norm(c.name.es) === key);
}

/** Busca un mapa por id o por nombre (inglés o español), sin importar mayúsculas. */
export function findMap(idOrName: string): GameMap | undefined {
  const key = norm(idOrName);
  return MAPS.find((m) => m.id === key || norm(m.name.en) === key || norm(m.name.es) === key);
}

/** Tipo del mapa (open/closed/hybrid/water), útil para armar el contexto de sugerencias. */
export function mapTypeOf(idOrName: string): MapType | undefined {
  return findMap(idOrName)?.type;
}
