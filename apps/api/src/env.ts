import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "falta DATABASE_URL"),
  DATABASE_SSL: z.enum(["disable", "require", "no-verify"]).default("disable"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3001"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  /**
   * Dominio padre compartido por la web y la API (ej. "aoe2overlay.com" para
   * aoe2overlay.com + api.aoe2overlay.com). Vacío en desarrollo.
   */
  COOKIE_DOMAIN: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  PORT: z.coerce.number().int().default(3001),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

/** Lee y valida las variables de entorno. Nunca imprime sus valores. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Configuración inválida (revisá apps/api/.env):\n${problems.join("\n")}`);
  }
  return result.data;
}
