import type { APIRoute } from "astro";
import { db } from "@/data/orm/connection";
import { seedE2EDatabase } from "@/test/e2e-seed";
import * as schema from "@/data/orm/schema";

function clearDatabase() {
  db.delete(schema.modelEquipmentOption).run();
  db.delete(schema.unitKeyword).run();
  db.delete(schema.session).run();
  db.delete(schema.model).run();
  db.delete(schema.equipmentOption).run();
  db.delete(schema.keyword).run();
  db.delete(schema.unit).run();
  db.delete(schema.adminUser).run();
}

export const POST: APIRoute = ({ url }) => {
  if (process.env.NODE_ENV !== "test") {
    return new Response(null, { status: 400 });
  }

  clearDatabase();

  if (url.searchParams.get("type") !== "empty") {
    seedE2EDatabase(db);
  }

  return new Response(null, { status: 200 });
};
