import { eq, asc, and, ne, sql } from "drizzle-orm";
import { db } from "@/data/orm/connection";
import { unit, keyword, unitKeyword } from "@/data/orm/schema";

interface UnitData {
  name: string;
  slug: string;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: number;
  objectiveControl: number;
  invulnerabilitySave?: number;
  description?: string;
  keywords?: string;
}

function syncKeywords(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  unitId: number,
  keywordsString?: string,
) {
  tx.delete(unitKeyword).where(eq(unitKeyword.unitId, unitId)).run();

  if (!keywordsString) return;

  const keywordNames = keywordsString
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  for (const name of keywordNames) {
    const existing = tx
      .select()
      .from(keyword)
      .where(eq(keyword.name, name))
      .get();

    let keywordId: number;
    if (existing) {
      keywordId = existing.id;
    } else {
      const created = tx
        .insert(keyword)
        .values({ name })
        .returning()
        .get();
      keywordId = created.id;
    }

    tx.insert(unitKeyword).values({ unitId, keywordId }).run();
  }
}

export function createUnit(data: UnitData) {
  return db.transaction((tx) => {
    const unitRow = tx
      .insert(unit)
      .values({
        name: data.name,
        slug: data.slug,
        movement: data.movement,
        toughness: data.toughness,
        save: data.save,
        wounds: data.wounds,
        leadership: data.leadership,
        objectiveControl: data.objectiveControl,
        invulnerabilitySave: data.invulnerabilitySave ?? null,
        description: data.description || null,
      })
      .returning()
      .get();

    syncKeywords(tx, unitRow.id, data.keywords);

    return unitRow;
  });
}

export function getUnitById(id: number) {
  return db.select().from(unit).where(eq(unit.id, id)).get() ?? null;
}

export function getKeywordsForUnit(unitId: number): string[] {
  const rows = db
    .select({ name: keyword.name })
    .from(unitKeyword)
    .innerJoin(keyword, eq(unitKeyword.keywordId, keyword.id))
    .where(eq(unitKeyword.unitId, unitId))
    .all();

  return rows.map((r) => r.name);
}

export function updateUnit(id: number, data: UnitData) {
  return db.transaction((tx) => {
    const unitRow = tx
      .update(unit)
      .set({
        name: data.name,
        slug: data.slug,
        movement: data.movement,
        toughness: data.toughness,
        save: data.save,
        wounds: data.wounds,
        leadership: data.leadership,
        objectiveControl: data.objectiveControl,
        invulnerabilitySave: data.invulnerabilitySave ?? null,
        description: data.description || null,
      })
      .where(eq(unit.id, id))
      .returning()
      .get();

    syncKeywords(tx, id, data.keywords);

    return unitRow;
  });
}

export interface DeleteResult {
  success: boolean;
}

export function deleteUnitById(id: number): DeleteResult {
  const result = db.delete(unit).where(eq(unit.id, id)).run();
  return { success: result.changes > 0 };
}

export function getAllUnits() {
  return db.select().from(unit).orderBy(asc(unit.name)).all();
}

const MAX_SEARCH_RESULTS = 50;

export function searchUnitsByName(query: string) {
  const escaped = query.replace(/[%_\\]/g, "\\$&");
  const pattern = `%${escaped}%`;
  return db
    .select()
    .from(unit)
    .where(sql`${unit.name} LIKE ${pattern} ESCAPE '\\'`)
    .orderBy(asc(unit.name))
    .limit(MAX_SEARCH_RESULTS)
    .all();
}

export function findUnitBySlug(slug: string) {
  return db.select().from(unit).where(eq(unit.slug, slug)).get() ?? null;
}

export function isSlugAvailable(slug: string, excludeId?: number): boolean {
  const conditions = [eq(unit.slug, slug)];
  if (excludeId !== undefined) {
    conditions.push(ne(unit.id, excludeId));
  }
  const existing = db
    .select()
    .from(unit)
    .where(and(...conditions))
    .get();
  return !existing;
}

export type FullUnit = NonNullable<ReturnType<typeof getFullUnitBySlug>>;

export function getFullUnitBySlug(slug: string) {
  const result = db.query.unit
    .findFirst({
      where: eq(unit.slug, slug),
      with: {
        models: {
          orderBy: (models, { asc }) => [asc(models.name)],
          with: {
            modelEquipmentOptions: {
              with: {
                equipmentOption: true,
              },
            },
          },
        },
        unitKeywords: {
          with: {
            keyword: true,
          },
        },
      },
    })
    .sync();

  if (!result) return null;

  const { models, unitKeywords, ...unitData } = result;

  return {
    ...unitData,
    keywords: unitKeywords.map((uk) => uk.keyword.name),
    models: models.map((m) => ({
      id: m.id,
      unitId: m.unitId,
      name: m.name,
      createdAt: m.createdAt,
      equipment: m.modelEquipmentOptions
        .map((meo) => ({
          id: meo.equipmentOption.id,
          name: meo.equipmentOption.name,
          range: meo.equipmentOption.range,
          attacks: meo.equipmentOption.attacks,
          skill: meo.equipmentOption.skill,
          strength: meo.equipmentOption.strength,
          armorPiercing: meo.equipmentOption.armorPiercing,
          damageMin: meo.equipmentOption.damageMin,
          damageMax: meo.equipmentOption.damageMax,
          isDefault: meo.isDefault,
        }))
        .sort((a, b) => {
          if (b.isDefault !== a.isDefault) return b.isDefault - a.isDefault;
          return a.name.localeCompare(b.name);
        }),
    })),
  };
}
