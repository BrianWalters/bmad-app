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

const {
  createEquipmentOptionForModel,
  getEquipmentOptionById,
  getEquipmentOptionsForModel,
  updateEquipmentOption,
  removeEquipmentOptionFromModel,
  setDefaultEquipment,
  unsetDefaultEquipment,
  getEquipmentOptionSummaryForModel,
  getEquipmentOptionSummariesForModels,
  getUnassociatedEquipmentOptions,
  associateEquipmentOptionWithModel,
  isEquipmentOptionAssociatedWithModel,
} = await import("@/data/repo/equipment-option-repository");
const {
  insertUnit,
  insertModel,
  insertEquipmentOption,
  linkEquipmentToModel,
  resetFixtures,
} = await import("@/test/fixtures");

describe("equipment-option-repository", () => {
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

  function makeUnitAndModel() {
    const u = insertUnit();
    const m = insertModel({ unitId: u.id });
    return { unit: u, model: m };
  }

  const equipmentData = {
    name: "Bolt Rifle",
    range: 30,
    attacks: 2,
    skill: 3,
    strength: 4,
    armorPiercing: 1,
    damageMin: 1,
    damageMax: 1,
  };

  describe("createEquipmentOptionForModel", () => {
    it("creates an equipment option and links it to a model", () => {
      const { model } = makeUnitAndModel();

      const option = createEquipmentOptionForModel(model.id, equipmentData);

      expect(option.name).toBe("Bolt Rifle");
      expect(option.id).toBeGreaterThan(0);

      const fetched = getEquipmentOptionById(option.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.name).toBe("Bolt Rifle");

      expect(isEquipmentOptionAssociatedWithModel(model.id, option.id)).toBe(true);
    });
  });

  describe("getEquipmentOptionById", () => {
    it("returns null when option does not exist", () => {
      expect(getEquipmentOptionById(999)).toBeNull();
    });

    it("returns the option when it exists", () => {
      const option = insertEquipmentOption({ name: "Power Sword" });
      const result = getEquipmentOptionById(option.id);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Power Sword");
    });
  });

  describe("getEquipmentOptionsForModel", () => {
    it("returns equipment options linked to a model", () => {
      const { model } = makeUnitAndModel();
      const eq1 = insertEquipmentOption({ name: "Chainsword" });
      const eq2 = insertEquipmentOption({ name: "Bolt Pistol" });
      linkEquipmentToModel(model.id, eq1.id, 0);
      linkEquipmentToModel(model.id, eq2.id, 1);

      const results = getEquipmentOptionsForModel(model.id);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe("Bolt Pistol");
      expect(results[0].isDefault).toBe(1);
      expect(results[1].name).toBe("Chainsword");
      expect(results[1].isDefault).toBe(0);
    });

    it("returns empty array when model has no equipment", () => {
      const { model } = makeUnitAndModel();
      expect(getEquipmentOptionsForModel(model.id)).toEqual([]);
    });
  });

  describe("updateEquipmentOption", () => {
    it("updates equipment option fields", () => {
      const option = insertEquipmentOption({ name: "Old Name" });

      const updated = updateEquipmentOption(option.id, {
        ...equipmentData,
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
      expect(getEquipmentOptionById(option.id)!.name).toBe("New Name");
    });
  });

  describe("removeEquipmentOptionFromModel", () => {
    it("removes the association and returns success", () => {
      const { model } = makeUnitAndModel();
      const option = insertEquipmentOption();
      linkEquipmentToModel(model.id, option.id);

      const result = removeEquipmentOptionFromModel(model.id, option.id);

      expect(result.success).toBe(true);
      expect(isEquipmentOptionAssociatedWithModel(model.id, option.id)).toBe(false);
    });

    it("returns failure when association does not exist", () => {
      const { model } = makeUnitAndModel();
      const result = removeEquipmentOptionFromModel(model.id, 999);
      expect(result.success).toBe(false);
    });
  });

  describe("setDefaultEquipment / unsetDefaultEquipment", () => {
    it("toggles the isDefault flag", () => {
      const { model } = makeUnitAndModel();
      const option = insertEquipmentOption();
      linkEquipmentToModel(model.id, option.id, 0);

      setDefaultEquipment(model.id, option.id);
      let options = getEquipmentOptionsForModel(model.id);
      expect(options[0].isDefault).toBe(1);

      unsetDefaultEquipment(model.id, option.id);
      options = getEquipmentOptionsForModel(model.id);
      expect(options[0].isDefault).toBe(0);
    });
  });

  describe("getEquipmentOptionSummaryForModel", () => {
    it("returns total count and default names", () => {
      const { model } = makeUnitAndModel();
      const eq1 = insertEquipmentOption({ name: "Bolt Rifle" });
      const eq2 = insertEquipmentOption({ name: "Chainsword" });
      const eq3 = insertEquipmentOption({ name: "Frag Grenades" });
      linkEquipmentToModel(model.id, eq1.id, 1);
      linkEquipmentToModel(model.id, eq2.id, 1);
      linkEquipmentToModel(model.id, eq3.id, 0);

      const summary = getEquipmentOptionSummaryForModel(model.id);

      expect(summary.total).toBe(3);
      expect(summary.defaultNames).toEqual(["Bolt Rifle", "Chainsword"]);
    });

    it("returns zero total when model has no equipment", () => {
      const { model } = makeUnitAndModel();
      const summary = getEquipmentOptionSummaryForModel(model.id);
      expect(summary.total).toBe(0);
      expect(summary.defaultNames).toEqual([]);
    });
  });

  describe("getEquipmentOptionSummariesForModels", () => {
    it("returns summaries keyed by model id", () => {
      const u = insertUnit();
      const m1 = insertModel({ unitId: u.id });
      const m2 = insertModel({ unitId: u.id });
      const eq1 = insertEquipmentOption({ name: "Bolt Rifle" });
      const eq2 = insertEquipmentOption({ name: "Chainsword" });
      linkEquipmentToModel(m1.id, eq1.id, 1);
      linkEquipmentToModel(m2.id, eq2.id, 0);

      const summaries = getEquipmentOptionSummariesForModels([m1.id, m2.id]);

      expect(summaries[m1.id].total).toBe(1);
      expect(summaries[m1.id].defaultNames).toEqual(["Bolt Rifle"]);
      expect(summaries[m2.id].total).toBe(1);
      expect(summaries[m2.id].defaultNames).toEqual([]);
    });

    it("returns empty object for empty input", () => {
      expect(getEquipmentOptionSummariesForModels([])).toEqual({});
    });
  });

  describe("getUnassociatedEquipmentOptions", () => {
    it("returns equipment not linked to the given model", () => {
      const { model } = makeUnitAndModel();
      const eq1 = insertEquipmentOption({ name: "Bolt Rifle" });
      const eq2 = insertEquipmentOption({ name: "Chainsword" });
      linkEquipmentToModel(model.id, eq1.id);

      const unassociated = getUnassociatedEquipmentOptions(model.id);

      expect(unassociated).toHaveLength(1);
      expect(unassociated[0].name).toBe("Chainsword");
    });

    it("returns all equipment when none are linked", () => {
      const { model } = makeUnitAndModel();
      insertEquipmentOption({ name: "Alpha" });
      insertEquipmentOption({ name: "Beta" });

      const unassociated = getUnassociatedEquipmentOptions(model.id);

      expect(unassociated).toHaveLength(2);
      expect(unassociated.map((e) => e.name)).toEqual(["Alpha", "Beta"]);
    });
  });

  describe("associateEquipmentOptionWithModel", () => {
    it("creates an association between model and equipment", () => {
      const { model } = makeUnitAndModel();
      const option = insertEquipmentOption();

      associateEquipmentOptionWithModel(model.id, option.id);

      expect(isEquipmentOptionAssociatedWithModel(model.id, option.id)).toBe(true);
    });
  });

  describe("isEquipmentOptionAssociatedWithModel", () => {
    it("returns false when no association exists", () => {
      const { model } = makeUnitAndModel();
      const option = insertEquipmentOption();
      expect(isEquipmentOptionAssociatedWithModel(model.id, option.id)).toBe(false);
    });
  });
});
