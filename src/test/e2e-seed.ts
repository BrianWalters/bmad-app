import type { DrizzleDatabase } from "@/data/orm/types";
import {
  unit,
  model,
  equipmentOption,
  modelEquipmentOption,
  keyword,
  unitKeyword,
} from "@/data/orm/schema";

export function seedE2EDatabase(db: DrizzleDatabase) {
  const unit1 = db
    .insert(unit)
    .values({
      name: "E2E Detail Test Unit",
      slug: "e2e-unit-detail-test",
      movement: 6,
      toughness: 4,
      save: 3,
      wounds: 2,
      leadership: 6,
      objectiveControl: 1,
      invulnerabilitySave: 4,
      description: "A unit created for E2E testing of the detail page.",
    })
    .returning()
    .get();

  db.insert(unit)
    .values({
      name: "E2E No Description Unit",
      slug: "e2e-unit-detail-no-desc",
      movement: 5,
      toughness: 3,
      save: 4,
      wounds: 1,
      leadership: 7,
      objectiveControl: 2,
    })
    .run();

  const w1 = db
    .insert(model)
    .values({ unitId: unit1.id, name: "Test Warrior" })
    .returning()
    .get();
  const w2 = db
    .insert(model)
    .values({ unitId: unit1.id, name: "Test Warrior" })
    .returning()
    .get();
  const h = db
    .insert(model)
    .values({ unitId: unit1.id, name: "Test Heavy" })
    .returning()
    .get();

  const bolter = db
    .insert(equipmentOption)
    .values({
      name: "E2E Bolter",
      range: 24,
      attacks: 2,
      skill: 3,
      strength: 4,
      armorPiercing: 1,
      damageMin: 1,
      damageMax: 1,
    })
    .returning()
    .get();

  const chainsword = db
    .insert(equipmentOption)
    .values({
      name: "E2E Chainsword",
      range: 0,
      attacks: 3,
      skill: 3,
      strength: 4,
      armorPiercing: 2,
      damageMin: 1,
      damageMax: 3,
    })
    .returning()
    .get();

  const heavyBolter = db
    .insert(equipmentOption)
    .values({
      name: "E2E Heavy Bolter",
      range: 36,
      attacks: 3,
      skill: 4,
      strength: 5,
      armorPiercing: 1,
      damageMin: 1,
      damageMax: 6,
    })
    .returning()
    .get();

  const powerFist = db
    .insert(equipmentOption)
    .values({
      name: "E2E Power Fist",
      range: 0,
      attacks: 2,
      skill: 3,
      strength: 8,
      armorPiercing: 3,
      damageMin: 2,
      damageMax: 2,
    })
    .returning()
    .get();

  const link = (modelId: number, eqId: number, isDefault: number) =>
    db.insert(modelEquipmentOption).values({ modelId, equipmentOptionId: eqId, isDefault }).run();

  link(w1.id, bolter.id, 1);
  link(w1.id, chainsword.id, 0);
  link(w2.id, bolter.id, 1);
  link(w2.id, chainsword.id, 0);
  link(h.id, heavyBolter.id, 1);
  link(h.id, powerFist.id, 1);

  const kw1 = db.insert(keyword).values({ name: "E2E-Infantry" }).returning().get();
  const kw2 = db.insert(keyword).values({ name: "E2E-Imperium" }).returning().get();
  db.insert(unitKeyword).values({ unitId: unit1.id, keywordId: kw1.id }).run();
  db.insert(unitKeyword).values({ unitId: unit1.id, keywordId: kw2.id }).run();
}
