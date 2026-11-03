/**
 * Valida todos los JSON de strategies/ contra el esquema y los datos del juego.
 * Uso: pnpm validate:strategies
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { findCiv, findMap } from "@age-overlay/game-data";
import { getCivilizations, strategySchema } from "@age-overlay/shared";

const dir = fileURLToPath(new URL("../strategies/", import.meta.url));
const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();

let failed = 0;

for (const file of files) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.json$/.test(file)) {
    errors.push("el nombre del archivo tiene que ser kebab-case (ej. fast-castle-boom.json)");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(join(dir, file), "utf8"));
  } catch (e) {
    errors.push(`JSON inválido: ${(e as Error).message}`);
  }

  if (raw !== undefined) {
    const result = strategySchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join(".") || "(raíz)"}: ${issue.message}`);
      }
    } else {
      const s = result.data;
      for (const civ of [...getCivilizations(s), ...(s.vs_civilizations ?? [])]) {
        if (!findCiv(civ)) errors.push(`civilización desconocida: "${civ}"`);
      }
      for (const map of s.maps ?? []) {
        if (!findMap(map)) errors.push(`mapa desconocido: "${map}"`);
      }
      s.build_order.forEach((step, i) => {
        const { wood, food, gold, stone, builder = 0 } = step.resources;
        const assigned = wood + food + gold + stone + builder;
        if (assigned !== step.villager_count) {
          warnings.push(
            `paso ${i + 1}: los recursos suman ${assigned} pero villager_count es ${step.villager_count}`,
          );
        }
      });
    }
  }

  if (errors.length) {
    failed++;
    console.error(`✗ ${file}`);
    for (const e of errors) console.error(`    ${e}`);
  } else {
    console.log(`✓ ${file}`);
  }
  for (const w of warnings) console.warn(`    ⚠ ${w}`);
}

console.log(`\n${files.length - failed}/${files.length} estrategias válidas`);
if (failed) process.exit(1);
