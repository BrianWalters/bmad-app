import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcrypt";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { adminUser } from "@/data/orm/schema.ts";

const BCRYPT_SALT_ROUNDS = 12;
const dbPath = process.env.DATABASE_PATH || "./data/sqlite.db";

const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./drizzle" });

const rl = readline.createInterface({ input, output });

async function main() {
  console.log("\n=== Create Admin User ===\n");

  const username = await rl.question("Username: ");
  if (!username.trim()) {
    console.error("Error: Username cannot be empty.");
    process.exit(1);
  }

  const password = await rl.question("Password: ");
  if (!password) {
    console.error("Error: Password cannot be empty.");
    process.exit(1);
  }

  const confirm = await rl.question("Confirm password: ");
  if (password !== confirm) {
    console.error("Error: Passwords do not match.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    db.insert(adminUser)
      .values({ username: username.trim(), passwordHash })
      .run();
    console.log(`\nAdmin user "${username.trim()}" created successfully.`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      console.error(`\nError: Username "${username.trim()}" already exists.`);
      process.exit(1);
    }
    throw err;
  } finally {
    rl.close();
    sqlite.close();
  }
}

main();
