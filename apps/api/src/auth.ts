import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Database } from "./db/client";
import * as schema from "./db/schema";
import type { Env } from "./env";

export function createAuth(
  db: Database,
  env: Pick<Env, "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL" | "CORS_ORIGINS"> & {
    COOKIE_DOMAIN?: string;
  },
) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: env.CORS_ORIGINS,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        // El rol nunca lo elige el usuario: se cambia con `pnpm --filter @age-overlay/api user:role`.
        role: { type: "string", defaultValue: "user", input: false },
      },
    },
    advanced: {
      // En producción la API va detrás de HTTPS: cookies Secure.
      useSecureCookies: env.BETTER_AUTH_URL.startsWith("https://"),
      // En producción la web (dominio.com) y la API (api.dominio.com) comparten la sesión.
      ...(env.COOKIE_DOMAIN && {
        crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN },
      }),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
