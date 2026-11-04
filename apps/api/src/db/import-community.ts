/**
 * Publica estrategias exportadas de Build Order Guide con la cuenta de un usuario.
 *
 * Uso:
 *   pnpm --filter @age-overlay/api import:community <carpeta> --author tu@email.com [--publish]
 *
 * - <carpeta>: archivos JSON exportados, cada uno llamado con el id de la estrategia en
 *   Build Order Guide (por ejemplo `aqo8MRuR07aaUKTSTt6V.json`, el id está en la URL).
 * - Sin `--publish` solo muestra qué haría (modo prueba).
 * - Idempotente: si se corre dos veces, actualiza en lugar de duplicar.
 * - El autor original y el link a la fuente se conservan en cada estrategia.
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { eq } from "drizzle-orm";
import { toColumns } from "../lib/strategy-columns";
import { loadEnv } from "../env";
import { createDb } from "./client";
import { prepareCommunityStrategy } from "./community";
import { strategies, user } from "./schema";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const authorEmail = args[args.indexOf("--author") + 1];
const publish = args.includes("--publish");

if (!dir || !args.includes("--author") || !authorEmail) {
  console.error("Uso: import:community <carpeta> --author tu@email.com [--publish]");
  process.exit(1);
}

const files = (await readdir(resolve(dir))).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) {
  console.error(`No hay archivos .json en ${dir}`);
  process.exit(1);
}

const { db, close } = createDb(loadEnv());
try {
  const [author] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, authorEmail.toLowerCase()));
  if (!author)
    throw new Error(`No existe un usuario con email ${authorEmail}. Registrate primero.`);

  console.log(
    `${publish ? "Publicando" : "Modo prueba (agregá --publish para guardar)"} como ${author.name}\n`,
  );
  let okCount = 0;

  for (const file of files) {
    const id = basename(file, ".json");
    const raw = JSON.parse(await readFile(join(resolve(dir), file), "utf8")) as unknown;
    const result = prepareCommunityStrategy(raw, id);
    if (!result.ok) {
      console.log(`✗ ${file}\n    ${result.errors.join("\n    ")}`);
      continue;
    }
    const { strategy, slug, warnings } = result;
    console.log(`✓ ${strategy.name} — ${strategy.author} → /estrategias/${slug}`);
    for (const w of warnings) console.log(`    ⚠ ${w}`);
    okCount++;

    if (publish) {
      const values = { ...toColumns(strategy), data: strategy, authorId: author.id };
      await db
        .insert(strategies)
        .values({ ...values, slug, visibility: "public" })
        .onConflictDoUpdate({ target: strategies.slug, set: values });
    }
  }
  console.log(`\n${okCount}/${files.length} válidas${publish ? " y publicadas" : ""}`);
} finally {
  await close();
}
