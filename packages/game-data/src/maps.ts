import type { MapType } from "@age-overlay/shared";
import type { LocalizedName } from "./types";

export interface GameMap {
  /** Id estable en snake_case. Es el que se usa en el campo `maps` de las estrategias. */
  id: string;
  name: LocalizedName;
  /**
   * open = abierto (Arabia), closed = cerrado (Arena, Selva Negra),
   * hybrid = tierra + agua, water = mayormente agua.
   */
  type: MapType;
}

/** Mapas habituales de partidas clasificatorias y casuales. Se pueden agregar más. */
export const MAPS = [
  { id: "acropolis", name: { en: "Acropolis", es: "Acrópolis" }, type: "closed" },
  { id: "arabia", name: { en: "Arabia", es: "Arabia" }, type: "open" },
  { id: "arena", name: { en: "Arena", es: "Arena" }, type: "closed" },
  { id: "baltic", name: { en: "Baltic", es: "Báltico" }, type: "water" },
  { id: "black_forest", name: { en: "Black Forest", es: "Selva Negra" }, type: "closed" },
  { id: "cenotes", name: { en: "Cenotes", es: "Cenotes" }, type: "open" },
  { id: "coastal", name: { en: "Coastal", es: "Costero" }, type: "hybrid" },
  { id: "continental", name: { en: "Continental", es: "Continental" }, type: "hybrid" },
  { id: "fortress", name: { en: "Fortress", es: "Fortaleza" }, type: "closed" },
  { id: "four_lakes", name: { en: "Four Lakes", es: "Cuatro Lagos" }, type: "hybrid" },
  { id: "ghost_lake", name: { en: "Ghost Lake", es: "Lago Fantasma" }, type: "open" },
  { id: "gold_rush", name: { en: "Gold Rush", es: "Fiebre del Oro" }, type: "open" },
  { id: "golden_pit", name: { en: "Golden Pit", es: "Pozo Dorado" }, type: "open" },
  { id: "golden_swamp", name: { en: "Golden Swamp", es: "Pantano Dorado" }, type: "hybrid" },
  { id: "hideout", name: { en: "Hideout", es: "Escondite" }, type: "closed" },
  { id: "highland", name: { en: "Highland", es: "Tierras Altas" }, type: "hybrid" },
  { id: "hill_fort", name: { en: "Hill Fort", es: "Fuerte de la Colina" }, type: "closed" },
  { id: "islands", name: { en: "Islands", es: "Islas" }, type: "water" },
  { id: "land_madness", name: { en: "Land Madness", es: "Locura Terrestre" }, type: "open" },
  { id: "land_nomad", name: { en: "Land Nomad", es: "Nómada Terrestre" }, type: "open" },
  { id: "lombardia", name: { en: "Lombardia", es: "Lombardía" }, type: "open" },
  { id: "mediterranean", name: { en: "Mediterranean", es: "Mediterráneo" }, type: "water" },
  { id: "megarandom", name: { en: "MegaRandom", es: "Megaaleatorio" }, type: "hybrid" },
  { id: "migration", name: { en: "Migration", es: "Migración" }, type: "water" },
  { id: "mongolia", name: { en: "Mongolia", es: "Mongolia" }, type: "open" },
  { id: "nomad", name: { en: "Nomad", es: "Nómada" }, type: "hybrid" },
  { id: "rivers", name: { en: "Rivers", es: "Ríos" }, type: "hybrid" },
  { id: "scandinavia", name: { en: "Scandinavia", es: "Escandinavia" }, type: "hybrid" },
  { id: "socotra", name: { en: "Socotra", es: "Socotra" }, type: "hybrid" },
  { id: "steppe", name: { en: "Steppe", es: "Estepa" }, type: "open" },
  { id: "team_islands", name: { en: "Team Islands", es: "Islas en Equipo" }, type: "water" },
  { id: "valley", name: { en: "Valley", es: "Valle" }, type: "open" },
] as const satisfies readonly GameMap[];
