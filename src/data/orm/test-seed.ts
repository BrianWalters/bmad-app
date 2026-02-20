import type Database from "better-sqlite3";

export function seedTestDatabase(sqlite: InstanceType<typeof Database>): void {
  const insertUnit = sqlite.prepare(
    `INSERT INTO unit (name, slug, movement, toughness, save, wounds, leadership, objective_control, invulnerability_save, description)
     VALUES (@name, @slug, @movement, @toughness, @save, @wounds, @leadership, @oc, @invSave, @desc)`,
  );

  const unit1 = insertUnit.run({
    name: "E2E Detail Test Unit",
    slug: "e2e-unit-detail-test",
    movement: 6,
    toughness: 4,
    save: 3,
    wounds: 2,
    leadership: 6,
    oc: 1,
    invSave: 4,
    desc: "A unit created for E2E testing of the detail page.",
  });
  const unit1Id = Number(unit1.lastInsertRowid);

  insertUnit.run({
    name: "E2E No Description Unit",
    slug: "e2e-unit-detail-no-desc",
    movement: 5,
    toughness: 3,
    save: 4,
    wounds: 1,
    leadership: 7,
    oc: 2,
    invSave: null,
    desc: null,
  });

  const insertModel = sqlite.prepare("INSERT INTO model (unit_id, name) VALUES (?, ?)");
  const w1 = insertModel.run(unit1Id, "Test Warrior");
  const w2 = insertModel.run(unit1Id, "Test Warrior");
  const h = insertModel.run(unit1Id, "Test Heavy");
  const w1Id = Number(w1.lastInsertRowid);
  const w2Id = Number(w2.lastInsertRowid);
  const hId = Number(h.lastInsertRowid);

  const insertEquip = sqlite.prepare(
    `INSERT INTO equipment_option (name, range, attacks, skill, strength, armor_piercing, damage_min, damage_max)
     VALUES (@name, @range, @attacks, @skill, @strength, @ap, @dMin, @dMax)`,
  );

  const bolter = insertEquip.run({
    name: "E2E Bolter",
    range: 24,
    attacks: 2,
    skill: 3,
    strength: 4,
    ap: 1,
    dMin: 1,
    dMax: 1,
  });
  const chainsword = insertEquip.run({
    name: "E2E Chainsword",
    range: 0,
    attacks: 3,
    skill: 3,
    strength: 4,
    ap: 2,
    dMin: 1,
    dMax: 3,
  });
  const heavyBolter = insertEquip.run({
    name: "E2E Heavy Bolter",
    range: 36,
    attacks: 3,
    skill: 4,
    strength: 5,
    ap: 1,
    dMin: 1,
    dMax: 6,
  });
  const powerFist = insertEquip.run({
    name: "E2E Power Fist",
    range: 0,
    attacks: 2,
    skill: 3,
    strength: 8,
    ap: 3,
    dMin: 2,
    dMax: 2,
  });

  const bolterId = Number(bolter.lastInsertRowid);
  const chainswordId = Number(chainsword.lastInsertRowid);
  const heavyBolterId = Number(heavyBolter.lastInsertRowid);
  const powerFistId = Number(powerFist.lastInsertRowid);

  const insertLink = sqlite.prepare(
    "INSERT INTO model_equipment_option (model_id, equipment_option_id, is_default) VALUES (?, ?, ?)",
  );
  insertLink.run(w1Id, bolterId, 1);
  insertLink.run(w1Id, chainswordId, 0);
  insertLink.run(w2Id, bolterId, 1);
  insertLink.run(w2Id, chainswordId, 0);
  insertLink.run(hId, heavyBolterId, 1);
  insertLink.run(hId, powerFistId, 1);

  const insertKeyword = sqlite.prepare("INSERT INTO keyword (name) VALUES (?)");
  const kw1 = insertKeyword.run("E2E-Infantry");
  const kw2 = insertKeyword.run("E2E-Imperium");

  sqlite
    .prepare("INSERT INTO unit_keyword (unit_id, keyword_id) VALUES (?, ?)")
    .run(unit1Id, Number(kw1.lastInsertRowid));
  sqlite
    .prepare("INSERT INTO unit_keyword (unit_id, keyword_id) VALUES (?, ?)")
    .run(unit1Id, Number(kw2.lastInsertRowid));
}
