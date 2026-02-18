import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Space Marine")).toBe("space-marine");
  });

  it("lowercases all characters", () => {
    expect(slugify("INTERCESSOR SQUAD")).toBe("intercessor-squad");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("unit@name!here")).toBe("unit-name-here");
  });

  it("collapses multiple hyphens into one", () => {
    expect(slugify("unit---name")).toBe("unit-name");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  Space Marine  ")).toBe("space-marine");
  });

  it("strips leading and trailing hyphens from special chars", () => {
    expect(slugify("--unit-name--")).toBe("unit-name");
  });

  it("handles accented characters", () => {
    expect(slugify("Élite Troupé")).toBe("elite-troupe");
  });

  it("handles mixed special characters and spaces", () => {
    expect(slugify("Unit (Alpha) #1")).toBe("unit-alpha-1");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("handles single word input", () => {
    expect(slugify("Devastator")).toBe("devastator");
  });
});
