import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import type { Env } from "../env";
import * as schema from "./schema";

export { schema };

/** Cualquier base Postgres de Drizzle: node-postgres en producción, PGlite en los tests. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

function sslOption(mode: Env["DATABASE_SSL"]): pg.PoolConfig["ssl"] {
  if (mode === "require") return { rejectUnauthorized: true };
  if (mode === "no-verify") return { rejectUnauthorized: false };
  return false;
}

export function createDb(env: Pick<Env, "DATABASE_URL" | "DATABASE_SSL">) {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: sslOption(env.DATABASE_SSL),
    max: 10,
  });
  const db = drizzle(pool, { schema }) as unknown as Database;
  return { db, close: () => pool.end() };
}
