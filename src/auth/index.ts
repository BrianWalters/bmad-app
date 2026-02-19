import { db } from "@/data/orm/connection";
import { SessionManager } from "@/auth/session";

export const sessionManager = new SessionManager(db);
