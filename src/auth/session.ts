import { randomUUID } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import type { DrizzleDatabase } from "../data/orm/types";
import { session, adminUser } from "../data/orm/schema";
import { generateCsrfToken } from "./csrf";
import bcrypt from "bcrypt";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BCRYPT_SALT_ROUNDS = 12;

export interface SessionData {
  userId: number;
  username: string;
  csrfToken: string;
  sessionId: string;
}

export class SessionManager {
  constructor(private db: DrizzleDatabase) {}

  createSession(userId: number): { sessionId: string; csrfToken: string } {
    const sessionId = randomUUID();
    const csrfToken = generateCsrfToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    this.db.insert(session).values({ sessionId, userId, csrfToken, expiresAt }).run();

    return { sessionId, csrfToken };
  }

  validateSession(sessionId: string): SessionData | null {
    const row = this.db
      .select({
        userId: session.userId,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt,
        sessionId: session.sessionId,
        username: adminUser.username,
      })
      .from(session)
      .innerJoin(adminUser, eq(session.userId, adminUser.id))
      .where(eq(session.sessionId, sessionId))
      .get();

    if (!row) return null;

    if (new Date(row.expiresAt) < new Date()) {
      this.destroySession(sessionId);
      return null;
    }

    return {
      userId: row.userId,
      username: row.username,
      csrfToken: row.csrfToken,
      sessionId: row.sessionId,
    };
  }

  destroySession(sessionId: string): void {
    this.db.delete(session).where(eq(session.sessionId, sessionId)).run();
  }

  cleanExpiredSessions(): number {
    const now = new Date().toISOString();
    const result = this.db.delete(session).where(lt(session.expiresAt, now)).run();
    return result.changes;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSessionCookieConfig(isProduction: boolean) {
  return {
    name: "session_id",
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
