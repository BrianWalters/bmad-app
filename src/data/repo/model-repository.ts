import { eq, asc } from "drizzle-orm";
import { db } from "@/data/orm/connection";
import { model } from "@/data/orm/schema";
import type { DeleteResult } from "@/data/repo/unit-repository";

interface ModelData {
  name: string;
}

export function createModel(unitId: number, data: ModelData) {
  return db
    .insert(model)
    .values({ unitId, name: data.name })
    .returning()
    .get();
}

export function getModelById(id: number) {
  return db.select().from(model).where(eq(model.id, id)).get() ?? null;
}

export function getModelsForUnit(unitId: number) {
  return db
    .select()
    .from(model)
    .where(eq(model.unitId, unitId))
    .orderBy(asc(model.name))
    .all();
}

export function updateModel(id: number, data: ModelData) {
  return db
    .update(model)
    .set({ name: data.name })
    .where(eq(model.id, id))
    .returning()
    .get();
}

export function deleteModelById(id: number): DeleteResult {
  const result = db.delete(model).where(eq(model.id, id)).run();
  return { success: result.changes > 0 };
}
