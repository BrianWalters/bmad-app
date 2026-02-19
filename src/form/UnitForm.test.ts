import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../data/orm/schema";

let sqlite: InstanceType<typeof Database>;
let testDb: ReturnType<typeof drizzle<typeof schema>>;

vi.mock("../data/orm/connection", () => ({
  get db() {
    return testDb;
  },
}));

const { UnitForm } = await import("./UnitForm");
const { createUnit, getUnitById, getKeywordsForUnit } = await import(
  "../data/repo/unit-repository"
);

function makeFormData(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
}

const validFormValues: Record<string, string> = {
  name: "Intercessor Squad",
  movement: "6",
  toughness: "4",
  save: "3",
  wounds: "2",
  leadership: "6",
  objectiveControl: "2",
  invulnerabilitySave: "4",
  description: "Elite ranged infantry",
  keywords: "Infantry, Imperium",
};

describe("UnitForm", () => {
  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    testDb = drizzle(sqlite, { schema });
    migrate(testDb, { migrationsFolder: "./drizzle" });
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("constructor without id (create mode)", () => {
    it("initializes with empty form data", () => {
      const form = new UnitForm();
      expect(form.isEditMode()).toBe(false);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBeNull();
    });

    it("returns fields with null values", () => {
      const form = new UnitForm();
      const fields = form.getFields();
      expect(fields.length).toBeGreaterThan(0);
      for (const field of fields) {
        expect(field.value).toBeNull();
      }
    });
  });

  describe("constructor with id (edit mode)", () => {
    it("loads existing unit data as form defaults", () => {
      const created = createUnit({
        name: "Intercessor Squad",
        slug: "intercessor-squad",
        movement: 6,
        toughness: 4,
        save: 3,
        wounds: 2,
        leadership: 6,
        objectiveControl: 2,
        invulnerabilitySave: 4,
        description: "Elite ranged infantry",
        keywords: "Infantry, Imperium",
      });

      const form = new UnitForm(created.id);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(true);
      expect(form.getValue("name")).toBe("Intercessor Squad");
      expect(form.getValue("movement")).toBe("6");
      expect(form.getValue("leadership")).toBe("6");
      expect(form.getValue("invulnerabilitySave")).toBe("4");
      expect(form.getValue("description")).toBe("Elite ranged infantry");
      expect(form.getValue("keywords")).toBe("Infantry, Imperium");
    });

    it("sets exists to false when unit not found", () => {
      const form = new UnitForm(999);
      expect(form.isEditMode()).toBe(true);
      expect(form.exists()).toBe(false);
    });

    it("populates field values from database", () => {
      const created = createUnit({
        name: "Hellblaster Squad",
        slug: "hellblaster-squad",
        movement: 6,
        toughness: 4,
        save: 3,
        wounds: 2,
        leadership: 6,
        objectiveControl: 2,
      });

      const form = new UnitForm(created.id);
      const fields = form.getFields();
      const nameField = fields.find((f) => f.name === "name");
      expect(nameField!.value).toBe("Hellblaster Squad");
    });

    it("handles empty optional fields", () => {
      const created = createUnit({
        name: "Basic Unit",
        slug: "basic-unit",
        movement: 5,
        toughness: 3,
        save: 4,
        wounds: 1,
        leadership: 7,
        objectiveControl: 1,
      });

      const form = new UnitForm(created.id);
      expect(form.getValue("invulnerabilitySave")).toBe("");
      expect(form.getValue("description")).toBe("");
      expect(form.getValue("keywords")).toBe("");
    });
  });

  describe("handleForm in create mode", () => {
    it("creates a new unit and returns true", () => {
      const form = new UnitForm();
      const result = form.handleForm(makeFormData(validFormValues));

      expect(result).toBe(true);

      const units = testDb.select().from(schema.unit).all();
      expect(units).toHaveLength(1);
      expect(units[0].name).toBe("Intercessor Squad");
    });

    it("returns false on validation failure", () => {
      const form = new UnitForm();
      const result = form.handleForm(
        makeFormData({ ...validFormValues, name: "" }),
      );
      expect(result).toBe(false);
      expect(form.getErrors().name).toBeTruthy();
    });
  });

  describe("handleForm in edit mode", () => {
    it("updates the existing unit and returns true", () => {
      const created = createUnit({
        name: "Old Name",
        slug: "old-name",
        movement: 5,
        toughness: 3,
        save: 4,
        wounds: 1,
        leadership: 7,
        objectiveControl: 1,
      });

      const form = new UnitForm(created.id);
      const result = form.handleForm(makeFormData(validFormValues));

      expect(result).toBe(true);

      const updated = getUnitById(created.id);
      expect(updated!.name).toBe("Intercessor Squad");
      expect(updated!.slug).toBe("intercessor-squad");
    });

    it("updates keyword associations", () => {
      const created = createUnit({
        name: "Intercessor Squad",
        slug: "intercessor-squad",
        movement: 6,
        toughness: 4,
        save: 3,
        wounds: 2,
        leadership: 6,
        objectiveControl: 2,
        keywords: "Infantry",
      });

      const form = new UnitForm(created.id);
      form.handleForm(
        makeFormData({
          ...validFormValues,
          keywords: "Vehicle, Astartes",
        }),
      );

      const keywords = getKeywordsForUnit(created.id);
      expect(keywords).toContain("Vehicle");
      expect(keywords).toContain("Astartes");
      expect(keywords).not.toContain("Infantry");
    });

    it("allows keeping the same slug when editing", () => {
      const created = createUnit({
        name: "Intercessor Squad",
        slug: "intercessor-squad",
        movement: 6,
        toughness: 4,
        save: 3,
        wounds: 2,
        leadership: 6,
        objectiveControl: 2,
      });

      const form = new UnitForm(created.id);
      const result = form.handleForm(makeFormData(validFormValues));
      expect(result).toBe(true);
      expect(form.getErrors().name).toBeUndefined();
    });

    it("rejects duplicate slug from a different unit", () => {
      createUnit({
        name: "Existing Unit",
        slug: "intercessor-squad",
        movement: 5,
        toughness: 3,
        save: 4,
        wounds: 1,
        leadership: 7,
        objectiveControl: 1,
      });

      const other = createUnit({
        name: "Other Unit",
        slug: "other-unit",
        movement: 5,
        toughness: 3,
        save: 4,
        wounds: 1,
        leadership: 7,
        objectiveControl: 1,
      });

      const form = new UnitForm(other.id);
      const result = form.handleForm(makeFormData(validFormValues));
      expect(result).toBe(false);
      expect(form.getErrors().name).toContain("similar name");
    });
  });
});
