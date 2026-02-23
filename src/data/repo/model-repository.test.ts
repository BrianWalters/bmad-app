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

const { createModel, getModelById, getModelsForUnit, updateModel, deleteModelById } =
  await import("@/data/repo/model-repository");
const { insertUnit, insertModel, resetFixtures } = await import(
  "@/test/fixtures"
);

describe("model-repository", () => {
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

  describe("createModel", () => {
    it("creates a model for a unit", () => {
      const u = insertUnit();
      const m = createModel(u.id, { name: "Sergeant" });

      expect(m.name).toBe("Sergeant");
      expect(m.unitId).toBe(u.id);
      expect(m.id).toBeGreaterThan(0);
    });
  });

  describe("getModelById", () => {
    it("returns the model when it exists", () => {
      const u = insertUnit();
      const created = insertModel({ unitId: u.id, name: "Marine" });

      const result = getModelById(created.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe("Marine");
      expect(result!.unitId).toBe(u.id);
    });

    it("returns null when model does not exist", () => {
      expect(getModelById(999)).toBeNull();
    });
  });

  describe("getModelsForUnit", () => {
    it("returns all models for a unit ordered by name", () => {
      const u = insertUnit();
      insertModel({ unitId: u.id, name: "Zephyr" });
      insertModel({ unitId: u.id, name: "Alpha" });
      insertModel({ unitId: u.id, name: "Mu" });

      const results = getModelsForUnit(u.id);

      expect(results).toHaveLength(3);
      expect(results.map((m) => m.name)).toEqual(["Alpha", "Mu", "Zephyr"]);
    });

    it("returns empty array when unit has no models", () => {
      const u = insertUnit();
      expect(getModelsForUnit(u.id)).toEqual([]);
    });

    it("does not return models from other units", () => {
      const u1 = insertUnit();
      const u2 = insertUnit();
      insertModel({ unitId: u1.id, name: "Marine" });
      insertModel({ unitId: u2.id, name: "Ranger" });

      const results = getModelsForUnit(u1.id);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Marine");
    });
  });

  describe("updateModel", () => {
    it("updates the model name", () => {
      const u = insertUnit();
      const m = insertModel({ unitId: u.id, name: "Marine" });

      const updated = updateModel(m.id, { name: "Veteran Marine" });

      expect(updated.name).toBe("Veteran Marine");
      expect(getModelById(m.id)!.name).toBe("Veteran Marine");
    });
  });

  describe("deleteModelById", () => {
    it("deletes an existing model and returns success", () => {
      const u = insertUnit();
      const m = insertModel({ unitId: u.id, name: "Marine" });

      const result = deleteModelById(m.id);

      expect(result.success).toBe(true);
      expect(getModelById(m.id)).toBeNull();
    });

    it("returns failure when model does not exist", () => {
      const result = deleteModelById(999);
      expect(result.success).toBe(false);
    });
  });
});
