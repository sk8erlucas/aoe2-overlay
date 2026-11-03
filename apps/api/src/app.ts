import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { fromNodeHeaders } from "better-auth/node";
import Fastify, { type FastifyServerOptions } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Auth } from "./auth";
import type { Database } from "./db/client";
import type { Env } from "./env";
import { HttpError, sessionHelpers } from "./lib/session";
import { miscRoutes } from "./routes/misc";
import { reportRoutes } from "./routes/reports";
import { strategyRoutes } from "./routes/strategies";
import { suggestionRoutes } from "./routes/suggestions";

export interface AppDeps {
  db: Database;
  auth: Auth;
  env: Pick<Env, "CORS_ORIGINS" | "BETTER_AUTH_URL">;
  logger?: FastifyServerOptions["logger"];
  /** Desactivar en tests. */
  rateLimit?: boolean;
}

export async function buildApp({
  db,
  auth,
  env,
  logger = false,
  rateLimit: limit = true,
}: AppDeps) {
  const app = Fastify({
    logger,
    trustProxy: true,
    // Las estrategias pueden ser largas, pero no más de 512 KB.
    bodyLimit: 512 * 1024,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // La API solo devuelve JSON: la CSP se desactiva para que funcione /api/docs.
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  if (limit) {
    await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: "AoE2 Overlay API",
        description: "API pública de estrategias de apertura para Age of Empires II: DE",
        version: "0.1.0",
      },
      servers: [{ url: env.BETTER_AUTH_URL }],
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: "/api/docs" });

  app.setErrorHandler((error, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        error: "Datos inválidos",
        issues: error.validation.map((v) => ({
          path: v.instancePath,
          message: v.message,
        })),
      });
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (status < 500) {
      return reply.status(status).send({ error: (error as Error).message });
    }
    req.log.error(error);
    return reply.status(500).send({ error: "Error interno" });
  });

  // --- Better Auth: /api/auth/* (registro, login, logout, sesión) ---
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: { hide: true },
    config: limit ? { rateLimit: { max: 30, timeWindow: "1 minute" } } : {},
    async handler(request, reply) {
      const url = new URL(request.url, env.BETTER_AUTH_URL);
      const req = new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header("set-cookie", cookies);
      return reply.send(response.body ? await response.text() : null);
    },
  });

  const session = sessionHelpers(auth);
  await app.register(miscRoutes, { prefix: "/api", db, session });
  await app.register(strategyRoutes, { prefix: "/api", db, session });
  await app.register(suggestionRoutes, { prefix: "/api", db });
  await app.register(reportRoutes, { prefix: "/api", db, session });

  return app;
}
