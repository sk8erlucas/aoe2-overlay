import { CIVS, MAPS } from "@age-overlay/game-data";
import { MAP_TYPES, POSITIONS } from "@age-overlay/shared";
import { sql } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { errorSchema } from "../lib/schemas";
import type { SessionHelpers } from "../lib/session";

export const miscRoutes: FastifyPluginAsyncZod<{ db: Database; session: SessionHelpers }> = async (
  app,
  { db, session },
) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["sistema"],
        summary: "Estado de la API y de la base de datos",
        response: {
          200: z.object({ ok: z.boolean(), db: z.boolean() }),
          503: z.object({ ok: z.boolean(), db: z.boolean() }),
        },
      },
      config: { rateLimit: false },
    },
    async (_req, reply) => {
      let dbOk = false;
      try {
        await db.execute(sql`select 1`);
        dbOk = true;
      } catch (e) {
        app.log.error(e, "health: la base no responde");
      }
      return reply.status(dbOk ? 200 : 503).send({ ok: dbOk, db: dbOk });
    },
  );

  const localized = z.object({ en: z.string(), es: z.string() });
  app.get(
    "/game-data",
    {
      schema: {
        tags: ["sistema"],
        summary: "Civilizaciones, mapas y valores válidos",
        response: {
          200: z.object({
            civs: z.array(z.object({ id: z.string(), name: localized })),
            maps: z.array(z.object({ id: z.string(), name: localized, type: z.string() })),
            mapTypes: z.array(z.string()),
            positions: z.array(z.string()),
          }),
        },
      },
    },
    async (_req, reply) => {
      reply.header("cache-control", "public, max-age=3600");
      return {
        civs: [...CIVS],
        maps: [...MAPS],
        mapTypes: [...MAP_TYPES],
        positions: [...POSITIONS],
      };
    },
  );

  app.get(
    "/me",
    {
      schema: {
        tags: ["cuenta"],
        summary: "Usuario de la sesión actual",
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.enum(["user", "moderator", "admin"]),
          }),
          401: errorSchema,
        },
      },
    },
    async (req) => session.requireUser(req),
  );
};
