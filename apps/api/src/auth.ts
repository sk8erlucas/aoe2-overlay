import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, deviceAuthorization } from "better-auth/plugins";
import type { Database } from "./db/client";
import { prepareAccountDeletion } from "./db/delete-account";
import * as schema from "./db/schema";
import type { Env } from "./env";

/** client_id que manda el overlay de escritorio en el flujo device-code. */
export const OVERLAY_CLIENT_ID = "aoe2-overlay";

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
        deviceCode: schema.deviceCode,
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
      // "Eliminar mi cuenta" en /perfil: POST /api/auth/delete-user con la contraseña.
      deleteUser: {
        enabled: true,
        beforeDelete: (account) => prepareAccountDeletion(db, account),
      },
    },
    plugins: [
      // Login del overlay: pide un código, el usuario lo confirma en la web (/dispositivo)
      // y el overlay recibe un token de sesión que manda como `Authorization: Bearer`.
      deviceAuthorization({
        expiresIn: "10m",
        interval: "5s",
        verificationUri: `${env.CORS_ORIGINS[0] ?? env.BETTER_AUTH_URL}/dispositivo`,
        validateClient: (clientId) => clientId === OVERLAY_CLIENT_ID,
      }),
      bearer(),
    ],
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
