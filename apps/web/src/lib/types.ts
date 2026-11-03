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
