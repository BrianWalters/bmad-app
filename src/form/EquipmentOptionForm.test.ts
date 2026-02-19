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

const { EquipmentOptionForm } = await import("@/form/EquipmentOptionForm");
const { createUnit } = await import("@/data/repo/unit-repository");
const { createModel } = await import("@/data/repo/model-repository");
const { createEquipmentOptionForModel, getEquipmentOptionById } = await import(
  "@/data/repo/equipment-option-repository"
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

const validFormInput = {
  name: "Bolt Rifle",
  range: "24",
  attacks: "2",
  skill: "3",
  strength: "4",
  armorPiercing: "1",
  damageMin: "1",
  damageMax: "2",
};

describe("EquipmentOptionForm", () => {
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
      const form = new EquipmentOptionForm(1);
      expect(form.isEditMode()).toBe(false);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBeNull();
      expect(form.getModelId()).toBe(1);
    });

    it("returns all fields with null values", () => {
      const form = new EquipmentOptionForm(1);
      const fields = form.getFields();
      expect(fields).toHaveLength(8);
      expect(fields.map((f) => f.name)).toEqual([
        "name",
        "range",
        "attacks",
        "skill",
        "strength",
        "armorPiercing",
        "damageMin",
        "damageMax",
      ]);
      for (const field of fields) {
        expect(field.value).toBeNull();
      }
    });
  });

  describe("constructor — edit mode", () => {
    it("loads existing equipment option data as form defaults", () => {
      const unit = createTestUnit();
      const model = createModel(unit.id, { name: "Phobos" });
      const option = createEquipmentOptionForModel(model.id, {
        name: "Bolt Rifle",
        range: 24,
        attacks: 2,
        skill: 3,
        strength: 4,
        armorPiercing: 1,
        damageMin: 1,
        damageMax: 2,
      });

      const form = new EquipmentOptionForm(model.id, option.id);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBe("Bolt Rifle");
      expect(form.getValue("range")).toBe("24");
      expect(form.getValue("attacks")).toBe("2");
      expect(form.getValue("skill")).toBe("3");
      expect(form.getValue("strength")).toBe("4");
      expect(form.getValue("armorPiercing")).toBe("1");
      expect(form.getValue("damageMin")).toBe("1");
      expect(form.getValue("damageMax")).toBe("2");
    });

    it("sets exists to false when equipment option not found", () => {
      const form = new EquipmentOptionForm(1, 999);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(false);
    });

    it("sets exists to false when equipment option not associated with model", () => {
      const unit = createTestUnit();
      const model1 = createModel(unit.id, { name: "Model A" });
      const model2 = createModel(unit.id, { name: "Model B" });
      const option = createEquipmentOptionForModel(model1.id, {
        name: "Bolt Rifle",
        range: 24,
        attacks: 2,
        skill: 3,
        strength: 4,
        armorPiercing: 1,
        damageMin: 1,
        damageMax: 2,
      });

      const form = new EquipmentOptionForm(model2.id, option.id);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(false);
    });
  });

  describe("handleForm — create mode", () => {
    it("creates a new equipment option and association, returns true", () => {
      const unit = createTestUnit();
      const model = createModel(unit.id, { name: "Phobos" });
      const form = new EquipmentOptionForm(model.id);
      const result = form.handleForm(makeFormData(validFormInput));

      expect(result).toBe(true);

      const options = testDb.select().from(schema.equipmentOption).all();
      expect(options).toHaveLength(1);
      expect(options[0].name).toBe("Bolt Rifle");
      expect(options[0].range).toBe(24);
      expect(options[0].attacks).toBe(2);

      const assocs = testDb.select().from(schema.modelEquipmentOption).all();
      expect(assocs).toHaveLength(1);
      expect(assocs[0].modelId).toBe(model.id);
      expect(assocs[0].equipmentOptionId).toBe(options[0].id);
    });
  });

  describe("handleForm — edit mode", () => {
    it("updates the existing equipment option and returns true", () => {
      const unit = createTestUnit();
      const model = createModel(unit.id, { name: "Phobos" });
      const option = createEquipmentOptionForModel(model.id, {
        name: "Old Name",
        range: 0,
        attacks: 1,
        skill: 4,
        strength: 3,
        armorPiercing: 0,
        damageMin: 1,
        damageMax: 1,
      });

      const form = new EquipmentOptionForm(model.id, option.id);
      const result = form.handleForm(makeFormData(validFormInput));

      expect(result).toBe(true);

      const updated = getEquipmentOptionById(option.id);
      expect(updated!.name).toBe("Bolt Rifle");
      expect(updated!.range).toBe(24);
      expect(updated!.attacks).toBe(2);
    });
  });

  describe("handleForm — validation failure", () => {
    it("returns false and populates errors on empty name", () => {
      const unit = createTestUnit();
      const model = createModel(unit.id, { name: "Phobos" });
      const form = new EquipmentOptionForm(model.id);
      const result = form.handleForm(
        makeFormData({ ...validFormInput, name: "" }),
      );

      expect(result).toBe(false);
      expect(form.getErrors().name).toBeTruthy();
    });

    it("returns false and populates errors when damageMax < damageMin", () => {
      const unit = createTestUnit();
      const model = createModel(unit.id, { name: "Phobos" });
      const form = new EquipmentOptionForm(model.id);
      const result = form.handleForm(
        makeFormData({ ...validFormInput, damageMin: "3", damageMax: "1" }),
      );

      expect(result).toBe(false);
      expect(form.getErrors().damageMax).toBeTruthy();
    });
  });
});
