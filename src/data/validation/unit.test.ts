import { describe, it, expect } from "vitest";
import { unitSchema } from "./unit";

describe("unitSchema", () => {
  const validInput = {
    name: "Intercessor Squad",
    movement: "6",
    toughness: "4",
    save: "3",
    wounds: "2",
    leadership: "6",
    objectiveControl: "2",
    invulnerabilitySave: "4",
  };

  it("accepts valid input with all required fields", () => {
    const result = unitSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("coerces string values to integers", () => {
    const result = unitSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.movement).toBe(6);
      expect(result.data.toughness).toBe(4);
      expect(result.data.save).toBe(3);
      expect(result.data.wounds).toBe(2);
      expect(result.data.objectiveControl).toBe(2);
    }
  });

  it("accepts valid input with optional fields", () => {
    const result = unitSchema.safeParse({
      ...validInput,
      invulnerabilitySave: "4",
      description: "Elite ranged infantry",
      keywords: "Infantry, Imperium, Adeptus Astartes",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invulnerabilitySave).toBe(4);
    }
  });

  it("rejects missing name", () => {
    const { name, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = unitSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing movement", () => {
    const { movement, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing toughness", () => {
    const { toughness, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing save", () => {
    const { save, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing wounds", () => {
    const { wounds, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing leadership", () => {
    const { leadership, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing objectiveControl", () => {
    const { objectiveControl, ...rest } = validInput;
    const result = unitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric string for integer fields", () => {
    const result = unitSchema.safeParse({ ...validInput, movement: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects decimal values for integer fields", () => {
    const result = unitSchema.safeParse({ ...validInput, wounds: "2.5" });
    expect(result.success).toBe(false);
  });

  it("allows optional invulnerabilitySave to be empty", () => {
    const result = unitSchema.safeParse({
      ...validInput,
      invulnerabilitySave: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional description to be empty", () => {
    const result = unitSchema.safeParse({
      ...validInput,
      description: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional keywords to be empty", () => {
    const result = unitSchema.safeParse({
      ...validInput,
      keywords: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional fields to be omitted entirely", () => {
    const input = { ...validInput, invulnerabilitySave: "4" };
    const result = unitSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.keywords).toBeUndefined();
    }
  });

  it("rejects empty required integer fields", () => {
    const result = unitSchema.safeParse({
      ...validInput,
      movement: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts only required fields with all optional fields omitted", () => {
    const requiredOnly = {
      name: "Intercessor Squad",
      movement: "6",
      toughness: "4",
      save: "3",
      wounds: "2",
      leadership: "6",
      objectiveControl: "2",
    };
    const result = unitSchema.safeParse(requiredOnly);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invulnerabilitySave).toBeUndefined();
      expect(result.data.description).toBeUndefined();
      expect(result.data.keywords).toBeUndefined();
    }
  });
});
