import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` solo lee el esquema: no necesita conexión.
// Para `drizzle-kit studio` hace falta DATABASE_URL (se lee del .env).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
