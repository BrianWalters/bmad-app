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

export const model = sqliteTable("model", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unitId: integer("unit_id")
    .notNull()
    .references(() => unit.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const equipmentOption = sqliteTable("equipment_option", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  range: integer("range").notNull().default(0),
  attacks: integer("attacks").notNull(),
  skill: integer("skill").notNull(),
  strength: integer("strength").notNull(),
  armorPiercing: integer("armor_piercing").notNull().default(0),
  damageMin: integer("damage_min").notNull().default(1),
  damageMax: integer("damage_max").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const modelEquipmentOption = sqliteTable(
  "model_equipment_option",
  {
    modelId: integer("model_id")
      .notNull()
      .references(() => model.id, { onDelete: "cascade" }),
    equipmentOptionId: integer("equipment_option_id")
      .notNull()
      .references(() => equipmentOption.id, { onDelete: "cascade" }),
    isDefault: integer("is_default").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.modelId, table.equipmentOptionId] }),
  ],
);

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
