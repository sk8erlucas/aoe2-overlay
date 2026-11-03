import { z } from "zod";

/**
 * Formato de estrategia (build order).
 *
 * Es compatible con el formato de la comunidad (Build Order Guide / RTS Overlay):
 * `name`, `civilization`, `author`, `source`, `description`, `build_order[]`.
 * A eso le sumamos campos opcionales propios (mapas, tipo de mapa, rival, posición, etc.)
 * que se usan para las sugerencias. Ver strategies/README.md.
 */

/** 1 = Alta Edad Media, 2 = Feudal, 3 = Castillos, 4 = Imperial. */
export const AGES = [1, 2, 3, 4] as const;
export type Age = (typeof AGES)[number];

export const MAP_TYPES = ["open", "closed", "hybrid", "water"] as const;
export type MapType = (typeof MAP_TYPES)[number];

export const POSITIONS = ["1v1", "flank", "pocket"] as const;
export type Position = (typeof POSITIONS)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Valores de `civilization` que significan "sirve para cualquier civ". */
export const GENERIC_CIVS = ["any", "generic"] as const;

const count = z.number().int().min(0);

export const resourcesSchema = z.object({
  wood: count,
  food: count,
  gold: count,
  stone: count,
  /** Aldeanos construyendo (opcional). */
  builder: count.optional(),
});
export type Resources = z.infer<typeof resourcesSchema>;

export const stepSchema = z.object({
  villager_count: count,
  age: z.number().int().min(1).max(4),
  /** Tiempo de juego del paso, en segundos o "m:ss". Si falta, se estima. */
  time: z.union([z.number().min(0), z.string().regex(/^\d{1,3}:[0-5]\d$/)]).optional(),
  resources: resourcesSchema,
  /** Texto del paso. Puede incluir íconos con la sintaxis `@categoria/archivo.png@`. */
  notes: z.array(z.string()).min(1),
});
export type Step = z.infer<typeof stepSchema>;

export const strategySchema = z.object({
  name: z.string().trim().min(1).max(100),
  /** Nombre en inglés de la civ, lista de civs, o "Any"/"Generic". */
  civilization: z.union([z.string().trim().min(1), z.array(z.string().trim().min(1)).min(1)]),
  author: z.string().trim().min(1),
  /** Solo http/https: se muestra como link en la web (evita `javascript:` y similares). */
  source: z.url({ protocol: /^https?$/ }).optional(),
  description: z.string().optional(),

  // --- Extensiones propias (opcionales) ---
  /** Ids de mapas (ver @age-overlay/game-data) donde la estrategia es buena. */
  maps: z.array(z.string()).optional(),
  map_types: z.array(z.enum(MAP_TYPES)).optional(),
  /** Civs rivales contra las que es especialmente buena. */
  vs_civilizations: z.array(z.string()).optional(),
  positions: z.array(z.enum(POSITIONS)).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  tags: z.array(z.string()).optional(),

  build_order: z.array(stepSchema).min(1),
});
export type Strategy = z.infer<typeof strategySchema>;

const normalize = (s: string) => s.trim().toLowerCase();

/** Lista de civs de la estrategia. Lista vacía = sirve para cualquier civ. */
export function getCivilizations(strategy: Pick<Strategy, "civilization">): string[] {
  const civs = Array.isArray(strategy.civilization)
    ? strategy.civilization
    : [strategy.civilization];
  return civs.filter((c) => !(GENERIC_CIVS as readonly string[]).includes(normalize(c)));
}

export function sameName(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}
