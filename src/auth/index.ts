import { db } from "../data/orm/connection";
import { SessionManager } from "./session";

export const sessionManager = new SessionManager(db);
