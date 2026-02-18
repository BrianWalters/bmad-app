import { eq } from "drizzle-orm";
import { db } from "../orm/connection";
import { adminUser } from "../orm/schema";

export function findUserByUsername(username: string) {
  return (
    db.select().from(adminUser).where(eq(adminUser.username, username)).get() ??
    null
  );
}
