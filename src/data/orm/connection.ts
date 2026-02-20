import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const isTestEnv = process.env.NODE_ENV === "test";
const dbPath = process.env.DATABASE_PATH || "./data/sqlite.db";

if (!isTestEnv) {
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

const sqlite = new Database(isTestEnv ? ":memory:" : dbPath);
if (!isTestEnv) {
  sqlite.pragma("journal_mode = WAL");
}
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function runMigrations() {
  migrate(db, { migrationsFolder: "./drizzle" });
}

if (isTestEnv) {
  runMigrations();
}
