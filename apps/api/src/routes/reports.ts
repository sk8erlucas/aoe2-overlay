import { desc, eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Database } from "../db/client";
import { REPORT_STATUSES, reports, strategies } from "../db/schema";
import { errorSchema, idParams, reportPatchBody, reportsQuery } from "../lib/schemas";
import { HttpError, type SessionHelpers } from "../lib/session";

const reportSchema = z.object({
  id: z.uuid(),
  reason: z.string(),
  status: z.enum(REPORT_STATUSES),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  strategy: z.object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    visibility: z.string(),
  }),
});

const TAG = ["moderación"];

export const reportRoutes: FastifyPluginAsyncZod<{
  db: Database;
  session: SessionHelpers;
}> = async (app, { db, session }) => {
  app.get(
    "/reports",
    {
      schema: {
        tags: TAG,
        summary: "Listar reportes (moderadores)",
        querystring: reportsQuery,
        response: {
          200: z.object({ items: z.array(reportSchema) }),
          401: errorSchema,
          403: errorSchema,
        },
      },
    },
    async (req) => {
      await session.requireModerator(req);
      const rows = await db
        .select({
          r: reports,
          s: {
            id: strategies.id,
            slug: strategies.slug,
            name: strategies.name,
            visibility: strategies.visibility,
          },
        })
        .from(reports)
        .innerJoin(strategies, eq(strategies.id, reports.strategyId))
        .where(eq(reports.status, req.query.status))
        .orderBy(desc(reports.createdAt))
        .limit(200);
      return {
        items: rows.map(({ r, s }) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
          strategy: s,
        })),
      };
    },
  );

  app.patch(
    "/reports/:id",
    {
      schema: {
        tags: TAG,
        summary: "Resolver o descartar un reporte (moderadores)",
        params: idParams,
        body: reportPatchBody,
        response: {
          200: z.object({ id: z.uuid(), status: z.enum(REPORT_STATUSES) }),
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req) => {
      const me = await session.requireModerator(req);
      const [report] = await db.select().from(reports).where(eq(reports.id, req.params.id));
      if (!report) throw new HttpError(404, "Reporte no encontrado");

      await db.transaction(async (tx) => {
        await tx
          .update(reports)
          .set({ status: req.body.status, resolvedById: me.id, resolvedAt: new Date() })
          .where(eq(reports.id, report.id));
        if (req.body.hideStrategy) {
          await tx
            .update(strategies)
            .set({ visibility: "hidden" })
            .where(eq(strategies.id, report.strategyId));
        }
      });
      return { id: report.id, status: req.body.status };
    },
  );
};
