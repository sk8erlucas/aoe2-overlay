import { getCivilizations, type Strategy } from "@age-overlay/shared";

const lower = (list: readonly string[] | undefined) =>
  [...new Set((list ?? []).map((s) => s.trim().toLowerCase()))].filter(Boolean);

/** Columnas de búsqueda derivadas del JSON de la estrategia. */
export function toColumns(strategy: Strategy) {
  return {
    name: strategy.name,
    civs: lower(getCivilizations(strategy)),
    maps: lower(strategy.maps),
    mapTypes: [...new Set(strategy.map_types ?? [])],
    positions: [...new Set(strategy.positions ?? [])],
    vsCivs: lower(strategy.vs_civilizations),
    difficulty: strategy.difficulty ?? null,
  };
}

/** "Fast Castle → Boom!" → "fast-castle-boom" */
export function slugify(text: string): string {
  const base = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "estrategia";
}

/** Slug único agregando un sufijo aleatorio corto. */
export function uniqueSlug(name: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(name)}-${suffix}`;
}
