import { eq, asc } from "drizzle-orm";
import { db } from "../orm/connection";
import { unit, keyword, unitKeyword } from "../orm/schema";

interface CreateUnitData {
  name: string;
  slug: string;
  movement: number;
  toughness: number;
  save: number;
  wounds: number;
  leadership: string;
  objectiveControl: number;
  invulnerabilitySave: number;
  description?: string;
  keywords?: string;
}

export function createUnit(data: CreateUnitData) {
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
        invulnerabilitySave: data.invulnerabilitySave,
        description: data.description || null,
      })
      .returning()
      .get();

    if (data.keywords) {
      const keywordNames = data.keywords
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

        tx.insert(unitKeyword)
          .values({ unitId: unitRow.id, keywordId })
          .run();
      }
    }

    return unitRow;
  });
}

export function getAllUnits() {
  return db.select().from(unit).orderBy(asc(unit.name)).all();
}

export function findUnitBySlug(slug: string) {
  return db.select().from(unit).where(eq(unit.slug, slug)).get() ?? null;
}

export function isSlugAvailable(slug: string): boolean {
  const existing = db.select().from(unit).where(eq(unit.slug, slug)).get();
  return !existing;
}
