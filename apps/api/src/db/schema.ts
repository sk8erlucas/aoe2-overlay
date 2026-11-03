import type { Strategy } from "@age-overlay/shared";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const textArray = (name: string) =>
  text(name)
    .array()
    .notNull()
    .default(sql`'{}'::text[]`);

export const ROLES = ["user", "moderator", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const VISIBILITIES = ["public", "unlisted", "hidden"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Better Auth (los nombres de las propiedades tienen que coincidir con los suyos)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").$type<Role>().notNull().default("user"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ---------------------------------------------------------------------------
// Estrategias
// ---------------------------------------------------------------------------

/**
 * Se guarda el JSON completo de la estrategia (`data`) y, aparte, columnas derivadas
 * para filtrar rápido. Las columnas se recalculan siempre desde `data` (ver toColumns).
 * Civs, mapas y civs rivales se guardan en minúsculas.
 */
export const strategies = pgTable(
  "strategies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    civs: textArray("civs"),
    maps: textArray("maps"),
    mapTypes: textArray("map_types"),
    positions: textArray("positions"),
    vsCivs: textArray("vs_civs"),
    difficulty: text("difficulty"),
    data: jsonb("data").$type<Strategy>().notNull(),
    visibility: text("visibility").$type<Visibility>().notNull().default("public"),
    verified: boolean("verified").notNull().default(false),
    /** Suma de votos (+1/−1), recalculada en cada voto. */
    score: integer("score").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("strategies_civs_idx").using("gin", t.civs),
    index("strategies_maps_idx").using("gin", t.maps),
    index("strategies_map_types_idx").using("gin", t.mapTypes),
    index("strategies_positions_idx").using("gin", t.positions),
    index("strategies_author_idx").on(t.authorId),
    index("strategies_score_idx").on(t.score),
    index("strategies_created_idx").on(t.createdAt),
  ],
);

export const votes = pgTable(
  "votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    value: smallint("value").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.strategyId] }),
    index("votes_strategy_idx").on(t.strategyId),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.strategyId] })],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategies.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id").references(() => user.id, { onDelete: "set null" }),
    reason: text("reason").notNull(),
    status: text("status").$type<ReportStatus>().notNull().default("open"),
    resolvedById: text("resolved_by_id").references(() => user.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("reports_status_idx").on(t.status)],
);
