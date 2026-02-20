import { db } from "@/data/orm/connection";
import {
  unit,
  model,
  equipmentOption,
  modelEquipmentOption,
  keyword,
  unitKeyword,
  adminUser,
  session,
} from "@/data/orm/schema";

let _seq = 0;

export function resetFixtures() {
  _seq = 0;
}

function seq() {
  return ++_seq;
}

type UnitInsert = typeof unit.$inferInsert;

export function insertUnit(overrides: Partial<UnitInsert> = {}) {
  const n = seq();
  return db
    .insert(unit)
    .values({
      name: `Test Unit ${n}`,
      slug: `test-unit-${n}`,
      movement: 6,
      toughness: 4,
      save: 3,
      wounds: 2,
      leadership: 6,
      objectiveControl: 2,
      ...overrides,
    })
    .returning()
    .get();
}

type ModelInsert = typeof model.$inferInsert;

export function insertModel(overrides: Partial<ModelInsert> = {}) {
  const unitId = overrides.unitId ?? insertUnit().id;
  return db
    .insert(model)
    .values({
      name: `Test Model ${seq()}`,
      ...overrides,
      unitId,
    })
    .returning()
    .get();
}

type EquipmentInsert = typeof equipmentOption.$inferInsert;

export function insertEquipmentOption(overrides: Partial<EquipmentInsert> = {}) {
  return db
    .insert(equipmentOption)
    .values({
      name: `Test Equipment ${seq()}`,
      range: 24,
      attacks: 2,
      skill: 3,
      strength: 4,
      armorPiercing: 1,
      damageMin: 1,
      damageMax: 1,
      ...overrides,
    })
    .returning()
    .get();
}

export function linkEquipmentToModel(
  modelId: number,
  equipmentOptionId: number,
  isDefault = 0,
) {
  db.insert(modelEquipmentOption)
    .values({ modelId, equipmentOptionId, isDefault })
    .run();
}

export function insertEquipmentOptionForModel(
  modelId: number,
  overrides: Partial<EquipmentInsert> = {},
  isDefault = 0,
) {
  const option = insertEquipmentOption(overrides);
  linkEquipmentToModel(modelId, option.id, isDefault);
  return option;
}

export function insertKeyword(name?: string) {
  return db
    .insert(keyword)
    .values({ name: name ?? `Keyword-${seq()}` })
    .returning()
    .get();
}

export function insertUnitKeyword(unitId: number, keywordName: string) {
  const kw = insertKeyword(keywordName);
  db.insert(unitKeyword).values({ unitId, keywordId: kw.id }).run();
  return kw;
}

type AdminUserInsert = typeof adminUser.$inferInsert;

export function insertAdminUser(overrides: Partial<AdminUserInsert> = {}) {
  const n = seq();
  return db
    .insert(adminUser)
    .values({
      username: `testuser${n}`,
      passwordHash: `hashed-password-${n}`,
      ...overrides,
    })
    .returning()
    .get();
}

type SessionInsert = typeof session.$inferInsert;

export function insertSession(overrides: Partial<SessionInsert> = {}) {
  const userId = overrides.userId ?? insertAdminUser().id;
  const n = seq();
  return db
    .insert(session)
    .values({
      sessionId: `test-session-${n}`,
      csrfToken: `test-csrf-${n}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      ...overrides,
      userId,
    })
    .returning()
    .get();
}
