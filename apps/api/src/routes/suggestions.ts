import { mapTypeOf } from "@age-overlay/game-data";
import { suggest, type Strategy } from "@age-overlay/shared";
import { and, eq, sql } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { strategies, user } from "../db/schema";
import { summarySchema, suggestionsQuery } from "../lib/schemas";
import { toSummary } from "../lib/serialize";

/** Máximo de candidatas que se puntúan en memoria. */
const MAX_CANDIDATES = 500;

export const suggestionRoutes: FastifyPluginAsyncZod<{ db: Database }> = async (app, { db }) => {
  app.get(
    "/suggestions",
    {
      schema: {
        tags: ["sugerencias"],
        summary: "Estrategias sugeridas para mapa, civ, rival y posición",
        description:
          "Usa el mismo algoritmo que el overlay offline (packages/shared/src/suggest.ts), ponderado por los votos.",
        querystring: suggestionsQuery,
        response: {
          200: z.object({
            items: z.array(
              z.object({
                strategy: summarySchema,
                match: z.number(),
                reasons: z.array(z.string()),
              }),
            ),
          }),
        },
      },
    },
    async (req) => {
      const q = req.query;
      // Prefiltro en SQL: públicas y de esa civ (o genéricas). El resto lo decide el score.
      const filters = [eq(strategies.visibility, "public")];
      if (q.civ) {
        filters.push(
          sql`(${strategies.civs} = '{}'::text[] or ${strategies.civs} @> array[${q.civ.toLowerCase()}]::text[])`,
        );
      }
      const rows = await db
        .select({ s: strategies, author: { id: user.id, name: user.name } })
        .from(strategies)
        .leftJoin(user, eq(user.id, strategies.authorId))
        .where(and(...filters))
        .limit(MAX_CANDIDATES);

      type Candidate = Strategy & { _row: (typeof rows)[number] };
      const candidates: Candidate[] = rows.map((r) => ({ ...r.s.data, _row: r }));
      const results = suggest(
        candidates,
        {
          civ: q.civ,
          vsCiv: q.vsCiv,
          map: q.map,
          mapType: q.map ? mapTypeOf(q.map) : undefined,
          position: q.position,
        },
        { limit: q.limit, getVotes: (c) => c._row.s.score },
      );

      return {
        items: results.map((r) => ({
          strategy: toSummary(r.strategy._row.s, r.strategy._row.author),
          match: Math.round(r.score * 10) / 10,
          reasons: r.reasons,
        })),
      };
    },
  );
};
