import { mapTypeOf } from "@age-overlay/game-data";
import { strategySchema } from "@age-overlay/shared";
import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { favorites, reports, strategies, user, votes } from "../db/schema";
import {
  detailSchema,
  errorSchema,
  favoriteBody,
  idParams,
  listQuery,
  listResponse,
  reportBody,
  slugParams,
  summarySchema,
  visibilityBody,
  voteBody,
} from "../lib/schemas";
import { toSummary } from "../lib/serialize";
import { HttpError, isStaff, type SessionHelpers, type SessionUser } from "../lib/session";
import { toColumns, uniqueSlug } from "../lib/strategy-columns";

interface Deps {
  db: Database;
  session: SessionHelpers;
}

const TAG = ["estrategias"];

/** `col` contiene el valor, o está vacía (estrategia genérica para ese criterio). */
const containsOrEmpty = (col: SQL | typeof strategies.civs, value: string) =>
  sql`(${col} = '{}'::text[] or ${col} @> array[${value}]::text[])`;

/** Escapa % y _ para ILIKE. */
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export function buildListFilters(query: z.infer<typeof listQuery>): SQL[] {
  const filters: SQL[] = [eq(strategies.visibility, "public")];
  if (query.civ) filters.push(containsOrEmpty(strategies.civs, query.civ.toLowerCase()));
  if (query.mapType) filters.push(containsOrEmpty(strategies.mapTypes, query.mapType));
  if (query.position) filters.push(containsOrEmpty(strategies.positions, query.position));
  if (query.map) {
    const map = query.map.toLowerCase();
    const type = mapTypeOf(map);
    const byMap = sql`${strategies.maps} @> array[${map}]::text[]`;
    const generic = sql`(${strategies.maps} = '{}'::text[] and ${strategies.mapTypes} = '{}'::text[])`;
    filters.push(
      type
        ? or(byMap, sql`${strategies.mapTypes} @> array[${type}]::text[]`, generic)!
        : or(byMap, generic)!,
    );
  }
  if (query.q) filters.push(ilike(strategies.name, `%${likeEscape(query.q)}%`));
  return filters;
}

export const strategyRoutes: FastifyPluginAsyncZod<Deps> = async (app, { db, session }) => {
  async function findById(id: string) {
    const [row] = await db.select().from(strategies).where(eq(strategies.id, id)).limit(1);
    if (!row) throw new HttpError(404, "Estrategia no encontrada");
    return row;
  }

  function assertCanEdit(row: typeof strategies.$inferSelect, me: SessionUser) {
    if (row.authorId !== me.id && !isStaff(me)) {
      throw new HttpError(403, "Solo el autor o un moderador puede modificarla");
    }
  }

  /** Estrategias visibles para `me`: públicas y no listadas para todos; ocultas solo para autor/staff. */
  function canSee(row: typeof strategies.$inferSelect, me: SessionUser | null) {
    return row.visibility !== "hidden" || row.authorId === me?.id || isStaff(me);
  }

  async function detail(row: typeof strategies.$inferSelect, me: SessionUser | null) {
    const [author] = row.authorId
      ? await db
          .select({ id: user.id, name: user.name })
          .from(user)
          .where(eq(user.id, row.authorId))
      : [];
    let myVote = 0;
    let isFavorite = false;
    if (me) {
      const [v] = await db
        .select({ value: votes.value })
        .from(votes)
        .where(and(eq(votes.userId, me.id), eq(votes.strategyId, row.id)));
      const [f] = await db
        .select({ userId: favorites.userId })
        .from(favorites)
        .where(and(eq(favorites.userId, me.id), eq(favorites.strategyId, row.id)));
      myVote = v?.value ?? 0;
      isFavorite = !!f;
    }
    return {
      ...toSummary(row, author ?? null),
      data: row.data,
      myVote,
      isFavorite,
      canEdit: !!me && (row.authorId === me.id || isStaff(me)),
    };
  }

  app.get(
    "/strategies",
    {
      schema: {
        tags: TAG,
        summary: "Listar estrategias públicas con filtros",
        querystring: listQuery,
        response: { 200: listResponse },
      },
    },
    async (req) => {
      const q = req.query;
      const where = and(...buildListFilters(q));
      const order =
        q.sort === "new"
          ? [desc(strategies.createdAt)]
          : [desc(strategies.verified), desc(strategies.score), desc(strategies.createdAt)];

      const [rows, [totalRow]] = await Promise.all([
        db
          .select({ s: strategies, author: { id: user.id, name: user.name } })
          .from(strategies)
          .leftJoin(user, eq(user.id, strategies.authorId))
          .where(where)
          .orderBy(...order, asc(strategies.id))
          .limit(q.pageSize)
          .offset((q.page - 1) * q.pageSize),
        db.select({ total: count() }).from(strategies).where(where),
      ]);

      return {
        items: rows.map((r) => toSummary(r.s, r.author)),
        total: totalRow?.total ?? 0,
        page: q.page,
        pageSize: q.pageSize,
      };
    },
  );

  app.get(
    "/strategies/:slug",
    {
      schema: {
        tags: TAG,
        summary: "Detalle de una estrategia (incluye el JSON completo)",
        params: slugParams,
        response: { 200: detailSchema, 404: errorSchema },
      },
    },
    async (req) => {
      const me = await session.optionalUser(req);
      const [row] = await db
        .select()
        .from(strategies)
        .where(eq(strategies.slug, req.params.slug))
        .limit(1);
      if (!row || !canSee(row, me)) throw new HttpError(404, "Estrategia no encontrada");
      return detail(row, me);
    },
  );

  app.post(
    "/strategies",
    {
      schema: {
        tags: TAG,
        summary: "Crear una estrategia",
        body: strategySchema.extend(visibilityBody.shape),
        response: { 201: detailSchema, 401: errorSchema },
      },
    },
    async (req, reply) => {
      const me = await session.requireUser(req);
      const { visibility, ...data } = req.body;
      const [row] = await db
        .insert(strategies)
        .values({
          ...toColumns(data),
          slug: uniqueSlug(data.name),
          authorId: me.id,
          data,
          // Solo el staff puede crear estrategias ocultas.
          visibility:
            visibility === "hidden" && !isStaff(me) ? "unlisted" : (visibility ?? "public"),
        })
        .returning();
      return reply.status(201).send(await detail(row!, me));
    },
  );

  app.put(
    "/strategies/:id",
    {
      schema: {
        tags: TAG,
        summary: "Reemplazar una estrategia (autor o moderador)",
        params: idParams,
        body: strategySchema.extend(visibilityBody.shape),
        response: { 200: detailSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
      },
    },
    async (req) => {
      const me = await session.requireUser(req);
      const row = await findById(req.params.id);
      assertCanEdit(row, me);
      const { visibility, ...data } = req.body;
      // Un autor no puede sacar su estrategia de "hidden" si la ocultó un moderador.
      const nextVisibility =
        visibility === undefined ||
        (!isStaff(me) && (row.visibility === "hidden" || visibility === "hidden"))
          ? row.visibility
          : visibility;
      const [updated] = await db
        .update(strategies)
        .set({ ...toColumns(data), data, visibility: nextVisibility })
        .where(eq(strategies.id, row.id))
        .returning();
      return detail(updated!, me);
    },
  );

  app.delete(
    "/strategies/:id",
    {
      schema: {
        tags: TAG,
        summary: "Borrar una estrategia (autor o moderador)",
        params: idParams,
        response: { 204: z.null(), 401: errorSchema, 403: errorSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      const me = await session.requireUser(req);
      const row = await findById(req.params.id);
      assertCanEdit(row, me);
      await db.delete(strategies).where(eq(strategies.id, row.id));
      return reply.status(204).send(null);
    },
  );

  app.post(
    "/strategies/:id/vote",
    {
      schema: {
        tags: TAG,
        summary: "Votar (+1, −1, o 0 para quitar el voto)",
        params: idParams,
        body: voteBody,
        response: {
          200: z.object({ score: z.number().int(), myVote: z.number().int() }),
          401: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req) => {
      const me = await session.requireUser(req);
      const row = await findById(req.params.id);
      if (!canSee(row, me)) throw new HttpError(404, "Estrategia no encontrada");
      const { value } = req.body;

      const score = await db.transaction(async (tx) => {
        if (value === 0) {
          await tx.delete(votes).where(and(eq(votes.userId, me.id), eq(votes.strategyId, row.id)));
        } else {
          await tx
            .insert(votes)
            .values({ userId: me.id, strategyId: row.id, value })
            .onConflictDoUpdate({ target: [votes.userId, votes.strategyId], set: { value } });
        }
        const [updated] = await tx
          .update(strategies)
          .set({
            score: sql`(select coalesce(sum(${votes.value}), 0) from ${votes} where ${votes.strategyId} = ${row.id})`,
            // No cambia updatedAt: un voto no es una edición.
            updatedAt: row.updatedAt,
          })
          .where(eq(strategies.id, row.id))
          .returning({ score: strategies.score });
        return updated!.score;
      });
      return { score, myVote: value };
    },
  );

  app.post(
    "/strategies/:id/favorite",
    {
      schema: {
        tags: TAG,
        summary: "Marcar o desmarcar como favorita",
        params: idParams,
        body: favoriteBody,
        response: {
          200: z.object({ isFavorite: z.boolean() }),
          401: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req) => {
      const me = await session.requireUser(req);
      const row = await findById(req.params.id);
      if (!canSee(row, me)) throw new HttpError(404, "Estrategia no encontrada");
      if (req.body.favorite) {
        await db
          .insert(favorites)
          .values({ userId: me.id, strategyId: row.id })
          .onConflictDoNothing();
      } else {
        await db
          .delete(favorites)
          .where(and(eq(favorites.userId, me.id), eq(favorites.strategyId, row.id)));
      }
      return { isFavorite: req.body.favorite };
    },
  );

  app.post(
    "/strategies/:id/report",
    {
      schema: {
        tags: TAG,
        summary: "Reportar una estrategia a los moderadores",
        params: idParams,
        body: reportBody,
        response: { 201: z.object({ id: z.uuid() }), 401: errorSchema, 404: errorSchema },
      },
      config: { rateLimit: { max: 10, timeWindow: "1 hour" } },
    },
    async (req, reply) => {
      const me = await session.requireUser(req);
      const row = await findById(req.params.id);
      if (!canSee(row, me)) throw new HttpError(404, "Estrategia no encontrada");
      const [report] = await db
        .insert(reports)
        .values({ strategyId: row.id, reporterId: me.id, reason: req.body.reason })
        .returning({ id: reports.id });
      return reply.status(201).send({ id: report!.id });
    },
  );

  // --- Del usuario logueado ---

  app.get(
    "/me/strategies",
    {
      schema: {
        tags: ["cuenta"],
        summary: "Mis estrategias (incluye no listadas y ocultas)",
        response: { 200: z.object({ items: z.array(summarySchema) }), 401: errorSchema },
      },
    },
    async (req) => {
      const me = await session.requireUser(req);
      const rows = await db
        .select()
        .from(strategies)
        .where(eq(strategies.authorId, me.id))
        .orderBy(desc(strategies.updatedAt));
      return { items: rows.map((r) => toSummary(r, { id: me.id, name: me.name })) };
    },
  );

  app.get(
    "/me/favorites",
    {
      schema: {
        tags: ["cuenta"],
        summary: "Mis estrategias favoritas",
        response: { 200: z.object({ items: z.array(summarySchema) }), 401: errorSchema },
      },
    },
    async (req) => {
      const me = await session.requireUser(req);
      const favRows = await db
        .select({ strategyId: favorites.strategyId })
        .from(favorites)
        .where(eq(favorites.userId, me.id))
        .orderBy(desc(favorites.createdAt));
      if (favRows.length === 0) return { items: [] };
      const ids = favRows.map((f) => f.strategyId);
      const rows = await db
        .select({ s: strategies, author: { id: user.id, name: user.name } })
        .from(strategies)
        .leftJoin(user, eq(user.id, strategies.authorId))
        .where(inArray(strategies.id, ids));
      const byId = new Map(rows.map((r) => [r.s.id, r]));
      return {
        items: ids
          .map((id) => byId.get(id))
          .filter((r) => r && canSee(r.s, me))
          .map((r) => toSummary(r!.s, r!.author)),
      };
    },
  );
};
