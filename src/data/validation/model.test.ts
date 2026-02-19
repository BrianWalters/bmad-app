import { describe, it, expect } from "vitest";
import { modelSchema } from "./model";

describe("modelSchema", () => {
  it("accepts valid input with a non-empty name", () => {
    const result = modelSchema.safeParse({ name: "Phobos" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Phobos");
    }
  });

  it("rejects missing name", () => {
    const result = modelSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = modelSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });
});
