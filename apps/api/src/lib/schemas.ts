/** Esquemas Zod de entrada y salida de la API (también generan la documentación OpenAPI). */
import { MAP_TYPES, POSITIONS } from "@age-overlay/shared";
import { z } from "zod";
import { REPORT_STATUSES, VISIBILITIES } from "../db/schema";

export const errorSchema = z.object({ error: z.string() });

export const idParams = z.object({ id: z.uuid() });
export const slugParams = z.object({ slug: z.string().min(1).max(100) });

export const listQuery = z.object({
  civ: z.string().max(40).optional(),
  map: z.string().max(40).optional(),
  mapType: z.enum(MAP_TYPES).optional(),
  position: z.enum(POSITIONS).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["top", "new"]).default("top"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const suggestionsQuery = z.object({
  civ: z.string().max(40).optional(),
  vsCiv: z.string().max(40).optional(),
  map: z.string().max(40).optional(),
  position: z.enum(POSITIONS).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const authorSchema = z.object({ id: z.string(), name: z.string() }).nullable();

export const summarySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  civilization: z.union([z.string(), z.array(z.string())]),
  description: z.string().nullable(),
  /** Autor original declarado en el JSON (puede no ser el usuario que la subió). */
  authorName: z.string(),
  /** Usuario que la publicó (null para las estrategias base). */
  author: authorSchema,
  maps: z.array(z.string()),
  mapTypes: z.array(z.string()),
  positions: z.array(z.string()),
  difficulty: z.string().nullable(),
  tags: z.array(z.string()),
  stepCount: z.number().int(),
  score: z.number().int(),
  verified: z.boolean(),
  visibility: z.enum(VISIBILITIES),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StrategySummary = z.infer<typeof summarySchema>;

export const listResponse = z.object({
  items: z.array(summarySchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const detailSchema = summarySchema.extend({
  /** JSON completo, en el formato de strategies/README.md. */
  data: z.unknown(),
  myVote: z.number().int(),
  isFavorite: z.boolean(),
  canEdit: z.boolean(),
});

export const voteBody = z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) });
export const favoriteBody = z.object({ favorite: z.boolean() });
export const reportBody = z.object({ reason: z.string().trim().min(3).max(500) });
export const visibilityBody = z.object({ visibility: z.enum(VISIBILITIES).optional() });

export const reportsQuery = z.object({ status: z.enum(REPORT_STATUSES).default("open") });
export const reportPatchBody = z.object({
  status: z.enum(["resolved", "dismissed"]),
  /** Si es true, la estrategia queda oculta (visibility = hidden). */
  hideStrategy: z.boolean().default(false),
});
