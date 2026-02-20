import { describe, it, expect } from "vitest";
import type { FullUnit } from "@/data/repo/unit-repository";
import { UnitPresenter } from "./UnitPresenter";

type Equipment = FullUnit["models"][number]["equipment"][number];
type Model = FullUnit["models"][number];

function makeEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: 100,
    name: "Bolt Rifle",
    range: 30,
    attacks: 2,
    skill: 3,
    strength: 4,
    armorPiercing: 1,
    damageMin: 1,
    damageMax: 1,
    isDefault: 1,
    ...overrides,
  };
}

function makeModel(overrides: Partial<Model> = {}): Model {
  return {
    id: 10,
    unitId: 1,
    name: "Intercessor",
    createdAt: "2026-01-01T00:00:00Z",
    equipment: [],
    ...overrides,
  };
}

function makeUnitDetail(overrides: Partial<FullUnit> = {}): FullUnit {
  return {
    id: 1,
    name: "Intercessor Squad",
    slug: "intercessor-squad",
    movement: 6,
    toughness: 4,
    save: 3,
    wounds: 2,
    leadership: 6,
    objectiveControl: 2,
    invulnerabilitySave: null,
    description: null,
    createdAt: "2026-01-01T00:00:00Z",
    keywords: [],
    models: [],
    ...overrides,
  };
}

describe("UnitPresenter", () => {
  describe("constructor", () => {
    it("extracts unit, keywords, and models from data", () => {
      const presenter = new UnitPresenter(makeUnitDetail());
      expect(presenter.unit.name).toBe("Intercessor Squad");
      expect(presenter.unit.keywords).toEqual([]);
      expect(presenter.modelGroups).toEqual([]);
    });
  });

  describe("formattedKeywords", () => {
    it("returns empty string when no keywords", () => {
      const presenter = new UnitPresenter(makeUnitDetail());
      expect(presenter.formattedKeywords).toBe("");
    });

    it("joins keywords with comma and space", () => {
      const presenter = new UnitPresenter(
        makeUnitDetail({ keywords: ["Infantry", "Imperium", "Tacticus"] }),
      );
      expect(presenter.formattedKeywords).toBe("Infantry, Imperium, Tacticus");
    });

    it("returns single keyword without separator", () => {
      const presenter = new UnitPresenter(
        makeUnitDetail({ keywords: ["Infantry"] }),
      );
      expect(presenter.formattedKeywords).toBe("Infantry");
    });
  });

  describe("formatDamage", () => {
    const presenter = new UnitPresenter(makeUnitDetail());

    it("returns flat number when min equals max", () => {
      expect(presenter.formatDamage(1, 1)).toBe("1");
      expect(presenter.formatDamage(3, 3)).toBe("3");
    });

    it("returns D notation when min is 1 and max is greater", () => {
      expect(presenter.formatDamage(1, 3)).toBe("D3");
      expect(presenter.formatDamage(1, 6)).toBe("D6");
    });

    it("returns range notation when min is not 1", () => {
      expect(presenter.formatDamage(2, 4)).toBe("2-4");
      expect(presenter.formatDamage(3, 6)).toBe("3-6");
    });
  });

  describe("formatAP", () => {
    const presenter = new UnitPresenter(makeUnitDetail());

    it("returns '0' for zero armor piercing", () => {
      expect(presenter.formatAP(0)).toBe("0");
    });

    it("returns negative notation for non-zero values", () => {
      expect(presenter.formatAP(1)).toBe("-1");
      expect(presenter.formatAP(2)).toBe("-2");
      expect(presenter.formatAP(4)).toBe("-4");
    });
  });

  describe("modelGroups", () => {
    it("returns empty array when no models provided", () => {
      const presenter = new UnitPresenter(makeUnitDetail());
      expect(presenter.modelGroups).toEqual([]);
    });

    it("creates one group per unique model name + equipment combination", () => {
      const eq = makeEquipment({ id: 1 });
      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [eq] }),
            makeModel({ id: 11, name: "Sergeant", equipment: [eq] }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(2);
      expect(presenter.modelGroups[0].name).toBe("Intercessor");
      expect(presenter.modelGroups[0].count).toBe(1);
      expect(presenter.modelGroups[1].name).toBe("Sergeant");
      expect(presenter.modelGroups[1].count).toBe(1);
    });

    it("collapses identical models into a single group with count", () => {
      const eq = makeEquipment({ id: 1 });
      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [eq] }),
            makeModel({ id: 11, name: "Intercessor", equipment: [eq] }),
            makeModel({ id: 12, name: "Intercessor", equipment: [eq] }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(1);
      expect(presenter.modelGroups[0].name).toBe("Intercessor");
      expect(presenter.modelGroups[0].count).toBe(3);
    });

    it("separates models with same name but different equipment", () => {
      const boltRifle = makeEquipment({ id: 1, name: "Bolt Rifle" });
      const plasmaPistol = makeEquipment({ id: 2, name: "Plasma Pistol" });

      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [boltRifle] }),
            makeModel({
              id: 11,
              name: "Intercessor",
              equipment: [plasmaPistol],
            }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(2);
      expect(presenter.modelGroups[0].count).toBe(1);
      expect(presenter.modelGroups[1].count).toBe(1);
    });

    it("differentiates by isDefault even when equipment id is the same", () => {
      const eqDefault = makeEquipment({ id: 1, isDefault: 1 });
      const eqNonDefault = makeEquipment({ id: 1, isDefault: 0 });

      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({
              id: 10,
              name: "Intercessor",
              equipment: [eqDefault],
            }),
            makeModel({
              id: 11,
              name: "Intercessor",
              equipment: [eqNonDefault],
            }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(2);
    });

    it("treats equipment order as irrelevant for grouping", () => {
      const eq1 = makeEquipment({ id: 1, name: "Bolt Rifle" });
      const eq2 = makeEquipment({ id: 2, name: "Chainsword" });

      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({
              id: 10,
              name: "Intercessor",
              equipment: [eq1, eq2],
            }),
            makeModel({
              id: 11,
              name: "Intercessor",
              equipment: [eq2, eq1],
            }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(1);
      expect(presenter.modelGroups[0].count).toBe(2);
    });

    it("preserves equipment on each group", () => {
      const eq = makeEquipment({ id: 1, name: "Bolt Rifle" });
      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [eq] }),
          ],
        }),
      );

      expect(presenter.modelGroups[0].equipment).toEqual([eq]);
    });

    it("caches result on repeated access", () => {
      const eq = makeEquipment({ id: 1 });
      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [eq] }),
          ],
        }),
      );

      const first = presenter.modelGroups;
      const second = presenter.modelGroups;
      expect(first).toBe(second);
    });

    it("handles models with no equipment", () => {
      const presenter = new UnitPresenter(
        makeUnitDetail({
          models: [
            makeModel({ id: 10, name: "Intercessor", equipment: [] }),
            makeModel({ id: 11, name: "Intercessor", equipment: [] }),
          ],
        }),
      );

      expect(presenter.modelGroups).toHaveLength(1);
      expect(presenter.modelGroups[0].count).toBe(2);
      expect(presenter.modelGroups[0].equipment).toEqual([]);
    });
  });
});
