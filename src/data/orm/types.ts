import { drizzle } from "drizzle-orm/better-sqlite3";
import type * as schema from "./schema";

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;
