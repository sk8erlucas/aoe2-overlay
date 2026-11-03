import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strategySchema } from "@age-overlay/shared";
import { toColumns } from "../lib/strategy-columns";
import type { Database } from "./client";
import { strategies } from "./schema";

export const STRATEGIES_DIR = fileURLToPath(new URL("../../../../strategies/", import.meta.url));

/**
 * Carga las estrategias base de strategies/*.json como "verificadas".
 * Es idempotente: el slug es el nombre del archivo y, si ya existe, se actualiza el contenido
 * (sin tocar votos).
 */
export async function seedStrategies(db: Database, dir = STRATEGIES_DIR): Promise<number> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  for (const file of files) {
    const data = strategySchema.parse(JSON.parse(await readFile(join(dir, file), "utf8")));
    const slug = file.replace(/\.json$/, "");
    const values = { ...toColumns(data), data, verified: true, visibility: "public" as const };
    await db
      .insert(strategies)
      .values({ ...values, slug })
      .onConflictDoUpdate({ target: strategies.slug, set: values });
  }
  return files.length;
}
