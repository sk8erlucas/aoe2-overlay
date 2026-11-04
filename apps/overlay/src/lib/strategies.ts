import { strategySchema, type Strategy } from "@age-overlay/shared";

export interface LoadedStrategy extends Strategy {
  /** Id estable: nombre de archivo (base) o slug de la API (descargadas). */
  id: string;
  origin: "bundled" | "remote";
  /** Votos en la comunidad (solo las descargadas). */
  score?: number;
  verified?: boolean;
}

/** Estrategias base empaquetadas en el instalador (carpeta strategies/ del repo). */
const modules = import.meta.glob<unknown>("../../../../strategies/*.json", {
  eager: true,
  import: "default",
});

function load(): LoadedStrategy[] {
  const result: LoadedStrategy[] = [];
  for (const [path, raw] of Object.entries(modules)) {
    const id = path
      .split("/")
      .pop()!
      .replace(/\.json$/, "");
    const parsed = strategySchema.safeParse(raw);
    if (parsed.success) result.push({ ...parsed.data, id, origin: "bundled", verified: true });
    else console.warn(`Estrategia inválida ignorada: ${id}`, parsed.error.issues);
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export const BUNDLED_STRATEGIES: readonly LoadedStrategy[] = load();

export const AGE_NAMES: Record<number, string> = {
  1: "Alta Edad Media",
  2: "Feudal",
  3: "Castillos",
  4: "Imperial",
};
