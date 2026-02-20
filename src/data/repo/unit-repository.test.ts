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

const { getFullUnitBySlug } = await import("@/data/repo/unit-repository");
const {
  insertUnit,
  insertModel,
  insertEquipmentOptionForModel,
  insertUnitKeyword,
  resetFixtures,
} = await import("@/test/fixtures");

describe("getFullUnitBySlug", () => {
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

  it("returns null when slug does not exist", () => {
    expect(getFullUnitBySlug("nonexistent")).toBeNull();
  });

  it("returns unit with empty keywords and models when none exist", () => {
    insertUnit({ slug: "bare-unit", name: "Bare Unit" });

    const result = getFullUnitBySlug("bare-unit");

    expect(result).not.toBeNull();
    expect(result!.name).toBe("Bare Unit");
    expect(result!.slug).toBe("bare-unit");
    expect(result!.keywords).toEqual([]);
    expect(result!.models).toEqual([]);
  });

  it("includes all unit scalar fields", () => {
    insertUnit({
      slug: "full-stats",
      name: "Full Stats",
      movement: 8,
      toughness: 5,
      save: 2,
      wounds: 3,
      leadership: 7,
      objectiveControl: 4,
      invulnerabilitySave: 4,
      description: "A test unit",
    });

    const result = getFullUnitBySlug("full-stats")!;

    expect(result.movement).toBe(8);
    expect(result.toughness).toBe(5);
    expect(result.save).toBe(2);
    expect(result.wounds).toBe(3);
    expect(result.leadership).toBe(7);
    expect(result.objectiveControl).toBe(4);
    expect(result.invulnerabilitySave).toBe(4);
    expect(result.description).toBe("A test unit");
  });

  it("includes keywords", () => {
    const u = insertUnit({ slug: "kw-unit" });
    insertUnitKeyword(u.id, "Infantry");
    insertUnitKeyword(u.id, "Imperium");

    const result = getFullUnitBySlug("kw-unit")!;

    expect(result.keywords).toHaveLength(2);
    expect(result.keywords).toContain("Infantry");
    expect(result.keywords).toContain("Imperium");
  });

  it("includes models with empty equipment", () => {
    const u = insertUnit({ slug: "model-unit" });
    insertModel({ unitId: u.id, name: "Sergeant" });
    insertModel({ unitId: u.id, name: "Marine" });

    const result = getFullUnitBySlug("model-unit")!;

    expect(result.models).toHaveLength(2);
    expect(result.models[0].name).toBe("Marine");
    expect(result.models[1].name).toBe("Sergeant");
    expect(result.models[0].equipment).toEqual([]);
  });

  it("models are ordered alphabetically by name", () => {
    const u = insertUnit({ slug: "ordered" });
    insertModel({ unitId: u.id, name: "Zephyr" });
    insertModel({ unitId: u.id, name: "Alpha" });
    insertModel({ unitId: u.id, name: "Mu" });

    const result = getFullUnitBySlug("ordered")!;
    const names = result.models.map((m) => m.name);

    expect(names).toEqual(["Alpha", "Mu", "Zephyr"]);
  });

  it("includes equipment on models", () => {
    const u = insertUnit({ slug: "equipped" });
    const m = insertModel({ unitId: u.id, name: "Intercessor" });
    insertEquipmentOptionForModel(m.id, {
      name: "Bolt Rifle",
      range: 30,
      attacks: 2,
      skill: 3,
      strength: 4,
      armorPiercing: 1,
      damageMin: 1,
      damageMax: 1,
    });

    const result = getFullUnitBySlug("equipped")!;

    expect(result.models).toHaveLength(1);
    expect(result.models[0].equipment).toHaveLength(1);

    const eq = result.models[0].equipment[0];
    expect(eq.name).toBe("Bolt Rifle");
    expect(eq.range).toBe(30);
    expect(eq.attacks).toBe(2);
    expect(eq.skill).toBe(3);
    expect(eq.strength).toBe(4);
    expect(eq.armorPiercing).toBe(1);
    expect(eq.damageMin).toBe(1);
    expect(eq.damageMax).toBe(1);
  });

  it("equipment is ordered by isDefault desc then name asc", () => {
    const u = insertUnit({ slug: "eq-order" });
    const m = insertModel({ unitId: u.id, name: "Marine" });
    insertEquipmentOptionForModel(m.id, { name: "Chainsword" }, 0);
    insertEquipmentOptionForModel(m.id, { name: "Bolt Pistol" }, 1);
    insertEquipmentOptionForModel(m.id, { name: "Auspex" }, 0);

    const result = getFullUnitBySlug("eq-order")!;
    const names = result.models[0].equipment.map((e) => e.name);

    expect(names).toEqual(["Bolt Pistol", "Auspex", "Chainsword"]);
  });

  it("equipment isDefault reflects the association value", () => {
    const u = insertUnit({ slug: "defaults" });
    const m = insertModel({ unitId: u.id, name: "Marine" });
    insertEquipmentOptionForModel(m.id, { name: "Default Gun" }, 1);
    insertEquipmentOptionForModel(m.id, { name: "Optional Gun" }, 0);

    const result = getFullUnitBySlug("defaults")!;
    const eqs = result.models[0].equipment;

    const defaultGun = eqs.find((e) => e.name === "Default Gun");
    const optionalGun = eqs.find((e) => e.name === "Optional Gun");
    expect(defaultGun!.isDefault).toBe(1);
    expect(optionalGun!.isDefault).toBe(0);
  });

  it("returns all data together — keywords, multiple models, equipment", () => {
    const u = insertUnit({ slug: "full-unit", name: "Full Unit" });
    insertUnitKeyword(u.id, "Infantry");
    insertUnitKeyword(u.id, "Imperium");

    const m1 = insertModel({ unitId: u.id, name: "Marine" });
    insertEquipmentOptionForModel(m1.id, { name: "Bolt Rifle" }, 1);
    insertEquipmentOptionForModel(m1.id, { name: "Frag Grenades" }, 1);

    const m2 = insertModel({ unitId: u.id, name: "Sergeant" });
    insertEquipmentOptionForModel(m2.id, { name: "Power Sword" }, 1);

    const result = getFullUnitBySlug("full-unit")!;

    expect(result.name).toBe("Full Unit");
    expect(result.keywords).toHaveLength(2);
    expect(result.models).toHaveLength(2);
    expect(result.models[0].name).toBe("Marine");
    expect(result.models[0].equipment).toHaveLength(2);
    expect(result.models[1].name).toBe("Sergeant");
    expect(result.models[1].equipment).toHaveLength(1);
  });

  it("does not duplicate data from keyword × model cross product", () => {
    const u = insertUnit({ slug: "cross-product" });
    insertUnitKeyword(u.id, "Alpha");
    insertUnitKeyword(u.id, "Beta");
    insertUnitKeyword(u.id, "Gamma");

    const m = insertModel({ unitId: u.id, name: "Marine" });
    insertEquipmentOptionForModel(m.id, { name: "Bolt Rifle" });
    insertEquipmentOptionForModel(m.id, { name: "Chainsword" });

    const result = getFullUnitBySlug("cross-product")!;

    expect(result.keywords).toHaveLength(3);
    expect(result.models).toHaveLength(1);
    expect(result.models[0].equipment).toHaveLength(2);
  });

  it("includes unitId on each model", () => {
    const u = insertUnit({ slug: "uid-check" });
    insertModel({ unitId: u.id, name: "Marine" });

    const result = getFullUnitBySlug("uid-check")!;

    expect(result.models[0].unitId).toBe(u.id);
  });
});
