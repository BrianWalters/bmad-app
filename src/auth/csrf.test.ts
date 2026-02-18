import { describe, it, expect } from "vitest";
import { validateCsrfToken } from "./csrf";

describe("validateCsrfToken", () => {
  it("returns true for matching tokens", () => {
    const token = "abc-123-def-456";
    expect(validateCsrfToken(token, token)).toBe(true);
  });

  it("returns false for mismatched tokens", () => {
    expect(validateCsrfToken("token-a", "token-b")).toBe(false);
  });

  it("returns false when session token is empty", () => {
    expect(validateCsrfToken("", "some-token")).toBe(false);
  });

  it("returns false when form token is empty", () => {
    expect(validateCsrfToken("some-token", "")).toBe(false);
  });

  it("returns false when tokens have different lengths", () => {
    expect(validateCsrfToken("short", "much-longer-token")).toBe(false);
  });
});
