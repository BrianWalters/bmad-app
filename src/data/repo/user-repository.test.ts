import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/data/orm/schema";

let sqlite: InstanceType<typeof Database>;
let testDb: ReturnType<typeof drizzle<typeof schema>>;

vi.mock("@/data/orm/connection", () => ({
  get db() {
    return testDb;
  },
}));

const { findUserByUsername } = await import("@/data/repo/user-repository");
const { insertAdminUser, resetFixtures } = await import("@/test/fixtures");

describe("user-repository", () => {
  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    testDb = drizzle(sqlite, { schema });
    migrate(testDb, { migrationsFolder: "./drizzle" });
    resetFixtures();
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("findUserByUsername", () => {
    it("returns the user when username exists", () => {
      insertAdminUser({ username: "admin" });

      const result = findUserByUsername("admin");

      expect(result).not.toBeNull();
      expect(result!.username).toBe("admin");
    });

    it("returns null when username does not exist", () => {
      expect(findUserByUsername("nonexistent")).toBeNull();
    });
  });
});
