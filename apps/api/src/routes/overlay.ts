import { createHash } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { strategies } from "../db/schema";

/** Máximo de estrategias que descarga el overlay (las mejores primero). */
export const OVERLAY_SYNC_LIMIT = 500;

const itemSchema = z.object({
  slug: z.string(),
  score: z.number().int(),
  verified: z.boolean(),
  updatedAt: z.string(),
  /** JSON completo de la estrategia (formato de strategies/README.md). */
  data: z.unknown(),
});

/**
 * Sincronización del overlay: todas las estrategias públicas con su JSON completo.
 * Soporta ETag: si nada cambió, responde 304 sin cuerpo (el overlay usa su caché).
 */
export const overlayRoutes: FastifyPluginAsyncZod<{ db: Database }> = async (app, { db }) => {
  app.get(
    "/overlay/strategies",
    {
      schema: {
        tags: ["overlay"],
        summary: "Estrategias públicas completas para el overlay (con ETag)",
        response: {
          200: z.object({ items: z.array(itemSchema), generatedAt: z.string() }),
          304: z.null(),
        },
      },
    },
    async (req, reply) => {
      const publicOnly = eq(strategies.visibility, "public");

      // Firma barata del estado: cantidad, última edición y suma de votos.
      const [sig] = await db
        .select({
          n: sql<number>`count(*)::int`,
          last: sql<string>`coalesce(max(${strategies.updatedAt})::text, '')`,
          votes: sql<number>`coalesce(sum(${strategies.score}), 0)::int`,
        })
        .from(strategies)
        .where(publicOnly);
      const etag = `"${createHash("sha1")
        .update(`${sig?.n}|${sig?.last}|${sig?.votes}|${OVERLAY_SYNC_LIMIT}`)
        .digest("base64url")}"`;

      reply.header("etag", etag);
      reply.header("cache-control", "no-cache");
      if (req.headers["if-none-match"] === etag) {
        return reply.status(304).send(null);
      }

      const rows = await db
        .select()
        .from(strategies)
        .where(publicOnly)
        .orderBy(desc(strategies.verified), desc(strategies.score), desc(strategies.updatedAt))
        .limit(OVERLAY_SYNC_LIMIT);

      return {
        generatedAt: new Date().toISOString(),
        items: rows.map((r) => ({
          slug: r.slug,
          score: r.score,
          verified: r.verified,
          updatedAt: r.updatedAt.toISOString(),
          data: r.data,
        })),
      };
    },
  );
};
