import { randomUUID, timingSafeEqual } from "node:crypto";

export function generateCsrfToken(): string {
  return randomUUID();
}

export function validateCsrfToken(
  sessionToken: string,
  formToken: string,
): boolean {
  if (!sessionToken || !formToken) return false;
  if (sessionToken.length !== formToken.length) return false;

  const a = Buffer.from(sessionToken, "utf-8");
  const b = Buffer.from(formToken, "utf-8");
  return timingSafeEqual(a, b);
}
