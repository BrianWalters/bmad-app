import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const adminUser = sqliteTable("admin_user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const session = sqliteTable(
  "session",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUser.id),
    csrfToken: text("csrf_token").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_session_expires_at").on(table.expiresAt)],
);

export const unit = sqliteTable("unit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  movement: integer("movement").notNull(),
  toughness: integer("toughness").notNull(),
  save: integer("save").notNull(),
  wounds: integer("wounds").notNull(),
  leadership: integer("leadership").notNull(),
  objectiveControl: integer("objective_control").notNull(),
  invulnerabilitySave: integer("invulnerability_save"),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const keyword = sqliteTable("keyword", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const unitKeyword = sqliteTable(
  "unit_keyword",
  {
    unitId: integer("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    keywordId: integer("keyword_id")
      .notNull()
      .references(() => keyword.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.unitId, table.keywordId] })],
);
