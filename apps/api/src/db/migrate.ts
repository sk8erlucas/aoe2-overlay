/** Aplica las migraciones de apps/api/drizzle. Uso: pnpm --filter @age-overlay/api db:migrate */
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { loadEnv } from "../env";
import { createDb } from "./client";

export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../../drizzle", import.meta.url));

const env = loadEnv();
const { db, close } = createDb(env);
try {
  await migrate(db as unknown as NodePgDatabase, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("✓ Migraciones aplicadas");
} finally {
  await close();
}
