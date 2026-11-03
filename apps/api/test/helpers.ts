/**
 * Entorno de test: Postgres en memoria (PGlite), sin tocar ninguna base real.
 */
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { buildApp } from "../src/app";
import { createAuth } from "../src/auth";
import type { Database } from "../src/db/client";
import * as schema from "../src/db/schema";
import { seedStrategies } from "../src/db/seed-strategies";

const MIGRATIONS = fileURLToPath(new URL("../drizzle", import.meta.url));
export const ORIGIN = "http://localhost:3000";

export async function createTestApp({ seed = true } = {}) {
  const client = new PGlite();
  const pgliteDb = drizzle(client, { schema });
  await migrate(pgliteDb, { migrationsFolder: MIGRATIONS });
  const db = pgliteDb as unknown as Database;
  if (seed) await seedStrategies(db);

  const env = {
    BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
    BETTER_AUTH_URL: "http://localhost:3001",
    CORS_ORIGINS: [ORIGIN],
  };
  const auth = createAuth(db, env);
  const app = await buildApp({ db, auth, env, rateLimit: false });
  await app.ready();

  return {
    app,
    db,
    async close() {
      await app.close();
      await client.close();
    },
    /** Registra un usuario y devuelve la cookie de sesión. */
    async signUp(name: string, email = `${name.toLowerCase()}@test.dev`, extra = {}) {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/sign-up/email",
        headers: { origin: ORIGIN },
        payload: { name, email, password: "contraseña-segura-123", ...extra },
      });
      if (res.statusCode !== 200) throw new Error(`signUp ${res.statusCode}: ${res.body}`);
      const raw = res.headers["set-cookie"];
      const cookies = (Array.isArray(raw) ? raw : [raw]).filter(Boolean) as string[];
      return cookies.map((c) => c.split(";")[0]).join("; ");
    },
    async setRole(email: string, role: schema.Role) {
      await db.update(schema.user).set({ role }).where(eq(schema.user.email, email));
    },
  };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

export const sampleStrategy = {
  name: "Elefantes malayos",
  civilization: "Malay",
  author: "tester",
  map_types: ["closed"],
  maps: ["black_forest"],
  build_order: [
    {
      villager_count: 6,
      age: 1,
      resources: { wood: 0, food: 6, gold: 0, stone: 0 },
      notes: ["6 aldeanos a las ovejas"],
    },
  ],
};
