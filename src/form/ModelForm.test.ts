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

const { ModelForm } = await import("@/form/ModelForm");
const { createUnit } = await import("@/data/repo/unit-repository");
const { createModel, getModelById } = await import(
  "@/data/repo/model-repository"
);

function makeFormData(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
}

function createTestUnit() {
  return createUnit({
    name: "Test Unit",
    slug: "test-unit",
    movement: 6,
    toughness: 4,
    save: 3,
    wounds: 2,
    leadership: 6,
    objectiveControl: 2,
  });
}

describe("ModelForm", () => {
  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    testDb = drizzle(sqlite, { schema });
    migrate(testDb, { migrationsFolder: "./drizzle" });
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("constructor — create mode", () => {
    it("initializes with empty form data", () => {
      const form = new ModelForm(1);
      expect(form.isEditMode()).toBe(false);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBeNull();
      expect(form.getUnitId()).toBe(1);
    });

    it("returns fields with null values", () => {
      const form = new ModelForm(1);
      const fields = form.getFields();
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe("name");
      expect(fields[0].value).toBeNull();
    });
  });

  describe("constructor — edit mode", () => {
    it("loads existing model data as form defaults", () => {
      const unit = createTestUnit();
      const created = createModel(unit.id, { name: "Phobos" });

      const form = new ModelForm(unit.id, created.id);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBe("Phobos");
      expect(form.getUnitId()).toBe(unit.id);
    });

    it("sets exists to false when model not found", () => {
      const form = new ModelForm(1, 999);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(false);
    });
  });

  describe("handleForm — create mode", () => {
    it("creates a new model and returns true", () => {
      const unit = createTestUnit();
      const form = new ModelForm(unit.id);
      const result = form.handleForm(makeFormData({ name: "Phobos" }));

      expect(result).toBe(true);

      const models = testDb.select().from(schema.model).all();
      expect(models).toHaveLength(1);
      expect(models[0].name).toBe("Phobos");
      expect(models[0].unitId).toBe(unit.id);
    });
  });

  describe("handleForm — edit mode", () => {
    it("updates the existing model and returns true", () => {
      const unit = createTestUnit();
      const created = createModel(unit.id, { name: "Old Name" });

      const form = new ModelForm(unit.id, created.id);
      const result = form.handleForm(makeFormData({ name: "New Name" }));

      expect(result).toBe(true);

      const updated = getModelById(created.id);
      expect(updated!.name).toBe("New Name");
    });
  });

  describe("handleForm — validation failure", () => {
    it("returns false and populates errors on empty name", () => {
      const unit = createTestUnit();
      const form = new ModelForm(unit.id);
      const result = form.handleForm(makeFormData({ name: "" }));

      expect(result).toBe(false);
      expect(form.getErrors().name).toBeTruthy();
    });
  });
});
