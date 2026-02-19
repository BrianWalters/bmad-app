import { describe, it, expect } from "vitest";
import { equipmentOptionSchema } from "./equipment-option";

describe("equipmentOptionSchema", () => {
  const validFull = {
    name: "Bolt Rifle",
    range: 24,
    attacks: 2,
    skill: 3,
    strength: 4,
    armorPiercing: 1,
    damageMin: 1,
    damageMax: 2,
  };

  it("accepts valid input with all fields", () => {
    const result = equipmentOptionSchema.safeParse(validFull);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Bolt Rifle");
      expect(result.data.range).toBe(24);
      expect(result.data.attacks).toBe(2);
      expect(result.data.skill).toBe(3);
      expect(result.data.strength).toBe(4);
      expect(result.data.armorPiercing).toBe(1);
      expect(result.data.damageMin).toBe(1);
      expect(result.data.damageMax).toBe(2);
    }
  });

  it("accepts valid input with only required fields (defaults applied)", () => {
    const result = equipmentOptionSchema.safeParse({
      name: "Combat Knife",
      attacks: 3,
      skill: 4,
      strength: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.range).toBe(0);
      expect(result.data.armorPiercing).toBe(0);
      expect(result.data.damageMin).toBe(1);
      expect(result.data.damageMax).toBe(1);
    }
  });

  it("coerces string values to numbers", () => {
    const result = equipmentOptionSchema.safeParse({
      name: "Bolt Rifle",
      range: "24",
      attacks: "2",
      skill: "3",
      strength: "4",
      armorPiercing: "1",
      damageMin: "1",
      damageMax: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.range).toBe(24);
      expect(result.data.attacks).toBe(2);
    }
  });

  it("rejects missing name", () => {
    const { name, ...rest } = validFull;
    const result = equipmentOptionSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) => i.path[0] === "name");
      expect(nameIssue?.message).toBe("Name is required");
    }
  });

  it("rejects whitespace-only name", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, name: "   " });
    expect(result.success).toBe(false);
  });

  it("trims name whitespace", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, name: "  Bolt Rifle  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Bolt Rifle");
    }
  });

  it("rejects missing required fields (attacks, skill, strength)", () => {
    const result = equipmentOptionSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("attacks");
      expect(paths).toContain("skill");
      expect(paths).toContain("strength");
    }
  });

  it("rejects damageMax less than damageMin", () => {
    const result = equipmentOptionSchema.safeParse({
      ...validFull,
      damageMin: 3,
      damageMax: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dmgIssue = result.error.issues.find((i) => i.path[0] === "damageMax");
      expect(dmgIssue?.message).toBe("Damage Max must be greater than or equal to Damage Min");
    }
  });

  it("accepts damageMax equal to damageMin", () => {
    const result = equipmentOptionSchema.safeParse({
      ...validFull,
      damageMin: 2,
      damageMax: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative range", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, range: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero attacks", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, attacks: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects zero skill", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, skill: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects zero strength", () => {
    const result = equipmentOptionSchema.safeParse({ ...validFull, strength: 0 });
    expect(result.success).toBe(false);
  });
});
