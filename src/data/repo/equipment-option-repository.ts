import { eq, and, asc, desc, notInArray, inArray } from "drizzle-orm";
import { db } from "@/data/orm/connection";
import { equipmentOption, modelEquipmentOption } from "@/data/orm/schema";
import type { DeleteResult } from "@/data/repo/unit-repository";

interface EquipmentOptionData {
  name: string;
  range: number;
  attacks: number;
  skill: number;
  strength: number;
  armorPiercing: number;
  damageMin: number;
  damageMax: number;
}

export function createEquipmentOptionForModel(
  modelId: number,
  data: EquipmentOptionData,
) {
  return db.transaction((tx) => {
    const option = tx
      .insert(equipmentOption)
      .values({
        name: data.name,
        range: data.range,
        attacks: data.attacks,
        skill: data.skill,
        strength: data.strength,
        armorPiercing: data.armorPiercing,
        damageMin: data.damageMin,
        damageMax: data.damageMax,
      })
      .returning()
      .get();

    tx.insert(modelEquipmentOption)
      .values({ modelId, equipmentOptionId: option.id })
      .run();

    return option;
  });
}

export function getEquipmentOptionById(id: number) {
  return (
    db
      .select()
      .from(equipmentOption)
      .where(eq(equipmentOption.id, id))
      .get() ?? null
  );
}

export function getEquipmentOptionsForModel(modelId: number) {
  return db
    .select({
      id: equipmentOption.id,
      name: equipmentOption.name,
      range: equipmentOption.range,
      attacks: equipmentOption.attacks,
      skill: equipmentOption.skill,
      strength: equipmentOption.strength,
      armorPiercing: equipmentOption.armorPiercing,
      damageMin: equipmentOption.damageMin,
      damageMax: equipmentOption.damageMax,
      isDefault: modelEquipmentOption.isDefault,
    })
    .from(modelEquipmentOption)
    .innerJoin(
      equipmentOption,
      eq(modelEquipmentOption.equipmentOptionId, equipmentOption.id),
    )
    .where(eq(modelEquipmentOption.modelId, modelId))
    .orderBy(desc(modelEquipmentOption.isDefault), asc(equipmentOption.name))
    .all();
}

export function updateEquipmentOption(id: number, data: EquipmentOptionData) {
  return db
    .update(equipmentOption)
    .set({
      name: data.name,
      range: data.range,
      attacks: data.attacks,
      skill: data.skill,
      strength: data.strength,
      armorPiercing: data.armorPiercing,
      damageMin: data.damageMin,
      damageMax: data.damageMax,
    })
    .where(eq(equipmentOption.id, id))
    .returning()
    .get();
}

export function removeEquipmentOptionFromModel(
  modelId: number,
  equipmentOptionId: number,
): DeleteResult {
  const result = db
    .delete(modelEquipmentOption)
    .where(
      and(
        eq(modelEquipmentOption.modelId, modelId),
        eq(modelEquipmentOption.equipmentOptionId, equipmentOptionId),
      ),
    )
    .run();
  return { success: result.changes > 0 };
}

export function setDefaultEquipment(
  modelId: number,
  equipmentOptionId: number,
) {
  db.update(modelEquipmentOption)
    .set({ isDefault: 1 })
    .where(
      and(
        eq(modelEquipmentOption.modelId, modelId),
        eq(modelEquipmentOption.equipmentOptionId, equipmentOptionId),
      ),
    )
    .run();
}

export function unsetDefaultEquipment(
  modelId: number,
  equipmentOptionId: number,
) {
  db.update(modelEquipmentOption)
    .set({ isDefault: 0 })
    .where(
      and(
        eq(modelEquipmentOption.modelId, modelId),
        eq(modelEquipmentOption.equipmentOptionId, equipmentOptionId),
      ),
    )
    .run();
}

export function getEquipmentOptionSummaryForModel(modelId: number) {
  const rows = db
    .select({
      name: equipmentOption.name,
      isDefault: modelEquipmentOption.isDefault,
    })
    .from(modelEquipmentOption)
    .innerJoin(
      equipmentOption,
      eq(modelEquipmentOption.equipmentOptionId, equipmentOption.id),
    )
    .where(eq(modelEquipmentOption.modelId, modelId))
    .all();

  return {
    total: rows.length,
    defaultNames: rows
      .filter((r) => r.isDefault === 1)
      .map((r) => r.name)
      .sort(),
  };
}

export function getEquipmentOptionSummariesForModels(
  modelIds: number[],
): Record<number, { total: number; defaultNames: string[] }> {
  if (modelIds.length === 0) return {};

  const rows = db
    .select({
      modelId: modelEquipmentOption.modelId,
      name: equipmentOption.name,
      isDefault: modelEquipmentOption.isDefault,
    })
    .from(modelEquipmentOption)
    .innerJoin(
      equipmentOption,
      eq(modelEquipmentOption.equipmentOptionId, equipmentOption.id),
    )
    .where(inArray(modelEquipmentOption.modelId, modelIds))
    .all();

  const result: Record<number, { total: number; defaultNames: string[] }> = {};
  for (const id of modelIds) {
    result[id] = { total: 0, defaultNames: [] };
  }
  for (const row of rows) {
    result[row.modelId].total++;
    if (row.isDefault === 1) {
      result[row.modelId].defaultNames.push(row.name);
    }
  }
  for (const id of modelIds) {
    result[id].defaultNames.sort();
  }
  return result;
}

export function getUnassociatedEquipmentOptions(modelId: number) {
  const associatedIds = db
    .select({ id: modelEquipmentOption.equipmentOptionId })
    .from(modelEquipmentOption)
    .where(eq(modelEquipmentOption.modelId, modelId))
    .all()
    .map((r) => r.id);

  const query = db
    .select({ id: equipmentOption.id, name: equipmentOption.name })
    .from(equipmentOption);

  if (associatedIds.length > 0) {
    return query
      .where(notInArray(equipmentOption.id, associatedIds))
      .orderBy(asc(equipmentOption.name))
      .all();
  }

  return query.orderBy(asc(equipmentOption.name)).all();
}

export function associateEquipmentOptionWithModel(
  modelId: number,
  equipmentOptionId: number,
) {
  db.insert(modelEquipmentOption)
    .values({ modelId, equipmentOptionId })
    .run();
}

export function isEquipmentOptionAssociatedWithModel(
  modelId: number,
  equipmentOptionId: number,
): boolean {
  const row = db
    .select()
    .from(modelEquipmentOption)
    .where(
      and(
        eq(modelEquipmentOption.modelId, modelId),
        eq(modelEquipmentOption.equipmentOptionId, equipmentOptionId),
      ),
    )
    .get();
  return !!row;
}
