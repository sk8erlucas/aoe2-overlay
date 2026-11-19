/** Tipos de las respuestas de la API (ver apps/api/src/lib/schemas.ts). */
import type { Strategy } from "@age-overlay/shared";

export type Role = "user" | "moderator" | "admin";
export type Visibility = "public" | "unlisted" | "hidden";

export interface Me {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface StrategySummary {
  id: string;
  slug: string;
  name: string;
  civilization: string | string[];
  description: string | null;
  authorName: string;
  author: { id: string; name: string } | null;
  maps: string[];
  mapTypes: string[];
  positions: string[];
  difficulty: string | null;
  tags: string[];
  stepCount: number;
  score: number;
  /** Partidas reportadas y ganadas (winrate = wins / games). */
  games: number;
  wins: number;
  verified: boolean;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyDetail extends StrategySummary {
  data: Strategy;
  myVote: number;
  isFavorite: boolean;
  canEdit: boolean;
  basedOn: { slug: string; name: string } | null;
}

export interface Comment {
  id: string;
  body: string;
  author: { id: string; name: string };
  createdAt: string;
  canDelete: boolean;
}

/** "62% de 13 partidas", o null si todavía no hay resultados. */
export function winrateLabel(s: Pick<StrategySummary, "games" | "wins">): string | null {
  if (s.games === 0) return null;
  const pct = Math.round((s.wins / s.games) * 100);
  return `${pct}% de ${s.games} ${s.games === 1 ? "partida" : "partidas"}`;
}

export interface StrategyList {
  items: StrategySummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Report {
  id: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
  strategy: { id: string; slug: string; name: string; visibility: string };
}
