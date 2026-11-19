/**
 * Comentarios y resultados (winrate) de las estrategias.
 */
import { asc, eq, sql, type SQL } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { comments, results, strategies, user } from "../db/schema";
import {
  commentBody,
  commentSchema,
  errorSchema,
  idParams,
  resultBody,
  resultResponse,
  slugParams,
} from "../lib/schemas";
import { HttpError, isStaff, type SessionHelpers, type SessionUser } from "../lib/session";

interface Deps {
  db: Database;
  session: SessionHelpers;
}

type StrategyRow = typeof strategies.$inferSelect;

export const socialRoutes: FastifyPluginAsyncZod<Deps> = async (app, { db, session }) => {
  const canSee = (row: StrategyRow, me: SessionUser | null) =>
    row.visibility !== "hidden" || row.authorId === me?.id || isStaff(me);

  async function visibleBy(where: SQL, me: SessionUser | null) {
    const [row] = await db.select().from(strategies).where(where).limit(1);
    if (!row || !canSee(row, me)) throw new HttpError(404, "Estrategia no encontrada");
    return row;
  }

  // --- Resultados ---

  async function addResult(row: StrategyRow, me: SessionUser, body: z.infer<typeof resultBody>) {
    return db.transaction(async (tx) => {
      // Si la partida ya se reportó, se actualiza (por si cambió el resultado) en vez de duplicar.
      if (body.matchId) {
        await tx
          .insert(results)
          .values({ strategyId: row.id, userId: me.id, matchId: body.matchId, won: body.won })
          .onConflictDoUpdate({
            target: [results.userId, results.matchId],
            set: { won: body.won, strategyId: row.id },
          });
      } else {
        await tx.insert(results).values({ strategyId: row.id, userId: me.id, won: body.won });
      }
      const [updated] = await tx
        .update(strategies)
        .set({
          games: sql`(select count(*) from ${results} where ${results.strategyId} = ${row.id})`,
          wins: sql`(select count(*) from ${results} where ${results.strategyId} = ${row.id} and ${results.won})`,
          // Un resultado no es una edición.
          updatedAt: row.updatedAt,
        })
        .where(eq(strategies.id, row.id))
        .returning({ games: strategies.games, wins: strategies.wins });
      return updated!;
    });
  }

  const resultSchema = <P extends typeof idParams | typeof slugParams>(
    params: P,
    summary: string,
  ) => ({
    schema: {
      tags: ["estrategias"],
      summary,
      params,
      body: resultBody,
      response: { 200: resultResponse, 401: errorSchema, 404: errorSchema },
    },
    config: { rateLimit: { max: 30, timeWindow: "1 hour" } },
  });

  app.post(
    "/strategies/:id/results",
    resultSchema(idParams, "Reportar si se ganó o perdió con la estrategia"),
    async (req) => {
      const me = await session.requireUser(req);
      const row = await visibleBy(eq(strategies.id, req.params.id), me);
      return addResult(row, me, req.body);
    },
  );

  // El overlay identifica las estrategias por slug.
  app.post(
    "/strategies/slug/:slug/results",
    resultSchema(slugParams, "Reportar un resultado, por slug (overlay)"),
    async (req) => {
      const me = await session.requireUser(req);
      const row = await visibleBy(eq(strategies.slug, req.params.slug), me);
      return addResult(row, me, req.body);
    },
  );

  // --- Comentarios ---

  app.get(
    "/strategies/:id/comments",
    {
      schema: {
        tags: ["estrategias"],
        summary: "Comentarios de una estrategia (del más viejo al más nuevo)",
        params: idParams,
        response: { 200: z.object({ items: z.array(commentSchema) }), 404: errorSchema },
      },
    },
    async (req) => {
      const me = await session.optionalUser(req);
      const row = await visibleBy(eq(strategies.id, req.params.id), me);
      const rows = await db
        .select({ c: comments, author: { id: user.id, name: user.name } })
        .from(comments)
        .innerJoin(user, eq(user.id, comments.userId))
        .where(eq(comments.strategyId, row.id))
        .orderBy(asc(comments.createdAt))
        .limit(200);
      return {
        items: rows.map(({ c, author }) => ({
          id: c.id,
          body: c.body,
          author,
          createdAt: c.createdAt.toISOString(),
          canDelete: !!me && (me.id === c.userId || isStaff(me)),
        })),
      };
    },
  );

  app.post(
    "/strategies/:id/comments",
    {
      schema: {
        tags: ["estrategias"],
        summary: "Comentar una estrategia",
        params: idParams,
        body: commentBody,
        response: { 201: commentSchema, 401: errorSchema, 404: errorSchema },
      },
      config: { rateLimit: { max: 20, timeWindow: "1 hour" } },
    },
    async (req, reply) => {
      const me = await session.requireUser(req);
      const row = await visibleBy(eq(strategies.id, req.params.id), me);
      const [c] = await db
        .insert(comments)
        .values({ strategyId: row.id, userId: me.id, body: req.body.body })
        .returning();
      return reply.status(201).send({
        id: c!.id,
        body: c!.body,
        author: { id: me.id, name: me.name },
        createdAt: c!.createdAt.toISOString(),
        canDelete: true,
      });
    },
  );

  app.delete(
    "/comments/:id",
    {
      schema: {
        tags: ["estrategias"],
        summary: "Borrar un comentario (autor o moderador)",
        params: idParams,
        response: { 204: z.null(), 401: errorSchema, 403: errorSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      const me = await session.requireUser(req);
      const [c] = await db.select().from(comments).where(eq(comments.id, req.params.id)).limit(1);
      if (!c) throw new HttpError(404, "Comentario no encontrado");
      if (c.userId !== me.id && !isStaff(me)) {
        throw new HttpError(403, "Solo el autor o un moderador puede borrarlo");
      }
      await db.delete(comments).where(eq(comments.id, c.id));
      return reply.status(204).send(null);
    },
  );
};
