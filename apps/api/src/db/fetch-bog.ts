/**
 * Baja las estrategias publicadas de Build Order Guide, elige las mejores por civilización y las
 * deja listas para `import:community` (ver docs/fase-9-estrategias-comunidad.md).
 *
 * Uso:
 *   pnpm --filter @age-overlay/api fetch:bog [--per-civ 2] [--min-ratings 3] [--refresh]
 *
 * - Lee la colección pública `published-builds` con una pedida por segundo como máximo.
 * - Guarda todo en imports/buildorderguide-raw/published-builds.json y lo reutiliza durante 30
 *   días (`--refresh` fuerza otra bajada).
 * - Escribe las elegidas en imports/buildorderguide-auto/<id>.json, ya en el formato del overlay.
 * - Saltea las que ya se cargaron a mano en imports/buildorderguide/ (mismo nombre y autor).
 * No escribe en la base: después se publica con
 *   pnpm --filter @age-overlay/api import:community ../../imports/buildorderguide-auto --author <email> [--publish]
 */
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { prepareCommunityStrategy } from "./community";
import {
  BOG_COLLECTION_URL,
  bogScore,
  fromFirestoreDocument,
  nameAuthorKey,
  selectBest,
  toOverlayStrategy,
  type BogBuild,
  type FirestoreDocument,
} from "./bog";

const args = process.argv.slice(2);
const option = (name: string, fallback: number) => {
  const i = args.indexOf(name);
  const value = i >= 0 ? Number(args[i + 1]) : fallback;
  return Number.isFinite(value) ? value : fallback;
};
const perCiv = option("--per-civ", 2);
const minRatings = option("--min-ratings", 3);
const refresh = args.includes("--refresh");
const minScore = option("--min-score", 3);
const fill = !args.includes("--no-fill");

const ROOT = resolve(import.meta.dirname, "../../../../imports");
const RAW = join(ROOT, "buildorderguide-raw", "published-builds.json");
const MANUAL = join(ROOT, "buildorderguide");
const OUT = join(ROOT, "buildorderguide-auto");
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const USER_AGENT = "aoe2-overlay-importer (+https://github.com/sk8erlucas/aoe2-overlay)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchAll(): Promise<BogBuild[]> {
  const builds: BogBuild[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(BOG_COLLECTION_URL);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    if (!res.ok) throw new Error(`Firestore respondió ${res.status}: ${await res.text()}`);
    const page = (await res.json()) as { documents?: FirestoreDocument[]; nextPageToken?: string };
    builds.push(...(page.documents ?? []).map(fromFirestoreDocument));
    process.stdout.write(`\r${builds.length} estrategias bajadas`);
    pageToken = page.nextPageToken;
    if (pageToken) await sleep(1000);
  } while (pageToken);
  process.stdout.write("\n");
  return builds;
}

async function loadBuilds(): Promise<BogBuild[]> {
  const cached = await stat(RAW).catch(() => null);
  if (cached && !refresh && Date.now() - cached.mtimeMs < MAX_AGE_MS) {
    console.log(
      `Usando la caché de ${cached.mtime.toISOString().slice(0, 10)} (--refresh para bajar de nuevo)`,
    );
    return JSON.parse(await readFile(RAW, "utf8")) as BogBuild[];
  }
  const builds = await fetchAll();
  await mkdir(join(ROOT, "buildorderguide-raw"), { recursive: true });
  await writeFile(RAW, JSON.stringify(builds));
  return builds;
}

/** "nombre|autor" de las estrategias cargadas a mano, para no duplicarlas. */
async function manualKeys(): Promise<Set<string>> {
  const files = (await readdir(MANUAL).catch(() => [] as string[])).filter((f) =>
    f.endsWith(".json"),
  );
  const keys = new Set<string>();
  for (const f of files) {
    const s = JSON.parse(await readFile(join(MANUAL, f), "utf8")) as {
      name?: string;
      author?: string;
    };
    if (s.name) keys.add(nameAuthorKey(s.name, s.author ?? ""));
  }
  return keys;
}

const builds = await loadBuilds();
const chosen = selectBest(builds, { perCiv, minRatings, minScore, fill, skip: await manualKeys() });

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let ok = 0;
const rows: string[] = [];
for (const build of chosen) {
  const strategy = toOverlayStrategy(build);
  const check = prepareCommunityStrategy(strategy, build.id);
  if (!check.ok) {
    rows.push(`✗ ${build.title} (${build.id}): ${check.errors.join("; ")}`);
    continue;
  }
  await writeFile(join(OUT, `${build.id}.json`), JSON.stringify(strategy, null, 2));
  ok++;
  rows.push(
    `✓ ${String(build.civilization).padEnd(16)} ${bogScore(build).toFixed(2)} ` +
      `(${build.avg_rating}★ × ${build.number_of_ratings}) ${build.title} — ${build.author}` +
      (check.warnings.length ? `  ⚠ ${check.warnings.join("; ")}` : ""),
  );
}
console.log(rows.sort().join("\n"));
console.log(
  `\n${builds.length} publicadas · ${chosen.length} elegidas (${perCiv} por civ con ≥${minRatings} calificaciones, puntaje ≥${minScore}${fill ? ", 1 de relleno para las civs sin calificar" : ""}) · ${ok} válidas → ${OUT}`,
);
