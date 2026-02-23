import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../data/orm/schema";
import type { DrizzleDatabase } from "../data/orm/types";
import { SessionManager, hashPassword, verifyPassword, getSessionCookieConfig } from "./session";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("my-secret");
    expect(hash).not.toBe("my-secret");
    expect(await verifyPassword("my-secret", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("SessionManager", () => {
  let sqlite: InstanceType<typeof Database>;
  let testDb: DrizzleDatabase;
  let manager: SessionManager;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    testDb = drizzle(sqlite, { schema });
    migrate(testDb, { migrationsFolder: "./drizzle" });
    manager = new SessionManager(testDb);

    testDb
      .insert(schema.adminUser)
      .values({ username: "testadmin", passwordHash: "$2b$12$placeholder" })
      .run();
  });

  afterEach(() => {
    sqlite.close();
  });

  it("creates a session and returns sessionId and csrfToken", () => {
    const result = manager.createSession(1);
    expect(result.sessionId).toBeTruthy();
    expect(result.csrfToken).toBeTruthy();
    expect(result.sessionId).not.toBe(result.csrfToken);

    const row = testDb.query.session.findFirst().sync();
    expect(row).toBeTruthy();
    expect(row!.sessionId).toBe(result.sessionId);
    expect(row!.csrfToken).toBe(result.csrfToken);
    expect(row!.userId).toBe(1);
  });

  it("validates a valid session and returns SessionData", () => {
    const { sessionId } = manager.createSession(1);
    const data = manager.validateSession(sessionId);

    expect(data).not.toBeNull();
    expect(data!.sessionId).toBe(sessionId);
    expect(data!.userId).toBe(1);
    expect(data!.username).toBe("testadmin");
    expect(data!.csrfToken).toBeTruthy();
  });

  it("returns null for a non-existent session", () => {
    expect(manager.validateSession("does-not-exist")).toBeNull();
  });

  it("returns null and destroys an expired session", () => {
    const { sessionId } = manager.createSession(1);

    // Manually expire the session by updating expires_at to the past
    testDb
      .update(schema.session)
      .set({ expiresAt: new Date(Date.now() - 1000).toISOString() })
      .run();

    const data = manager.validateSession(sessionId);
    expect(data).toBeNull();

    const row = testDb.query.session.findFirst().sync();
    expect(row).toBeUndefined();
  });

  it("destroys a session", () => {
    const { sessionId } = manager.createSession(1);
    manager.destroySession(sessionId);

    const row = testDb.query.session.findFirst().sync();
    expect(row).toBeUndefined();
  });

  it("cleans expired sessions and returns count", () => {
    manager.createSession(1);
    manager.createSession(1);

    // Expire both sessions
    testDb
      .update(schema.session)
      .set({ expiresAt: new Date(Date.now() - 1000).toISOString() })
      .run();

    // Add one valid session
    manager.createSession(1);

    const cleaned = manager.cleanExpiredSessions();
    expect(cleaned).toBe(2);

    const remaining = testDb.query.session.findMany().sync();
    expect(remaining).toHaveLength(1);
  });

  it("enforces foreign key on user_id", () => {
    expect(() => manager.createSession(999)).toThrow();
  });
});

describe("getSessionCookieConfig", () => {
  it("sets secure flag in production", () => {
    const config = getSessionCookieConfig(true);
    expect(config.secure).toBe(true);
    expect(config.httpOnly).toBe(true);
    expect(config.sameSite).toBe("strict");
    expect(config.path).toBe("/");
  });

  it("disables secure flag outside production", () => {
    const config = getSessionCookieConfig(false);
    expect(config.secure).toBe(false);
  });
});
