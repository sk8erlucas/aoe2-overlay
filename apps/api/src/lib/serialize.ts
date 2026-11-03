import type { strategies, user } from "../db/schema";
import type { StrategySummary } from "./schemas";

type StrategyRow = typeof strategies.$inferSelect;
type AuthorRow = Pick<typeof user.$inferSelect, "id" | "name"> | null;

export function toSummary(row: StrategyRow, author: AuthorRow): StrategySummary {
  const d = row.data;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    civilization: d.civilization,
    description: d.description ?? null,
    authorName: d.author,
    author: author?.id ? { id: author.id, name: author.name } : null,
    maps: row.maps,
    mapTypes: row.mapTypes,
    positions: row.positions,
    difficulty: row.difficulty,
    tags: d.tags ?? [],
    stepCount: d.build_order.length,
    score: row.score,
    verified: row.verified,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
