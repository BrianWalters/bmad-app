import type { FullUnit } from "@/data/repo/unit-repository";

type Equipment = FullUnit["models"][number]["equipment"][number];

export interface ModelGroup {
  name: string;
  count: number;
  equipment: Equipment[];
}

export class UnitPresenter {
  readonly unit: FullUnit;
  private _modelGroups: ModelGroup[] | null = null;

  constructor(data: FullUnit) {
    this.unit = data;
  }

  get modelGroups(): ModelGroup[] {
    if (this._modelGroups) return this._modelGroups;

    const groups: ModelGroup[] = [];
    const seen = new Map<string, number>();

    for (const m of this.unit.models) {
      const sig = `${m.name}|${UnitPresenter.getEquipmentSignature(m.equipment)}`;
      const idx = seen.get(sig);
      if (idx !== undefined) {
        groups[idx].count++;
      } else {
        seen.set(sig, groups.length);
        groups.push({ name: m.name, count: 1, equipment: m.equipment });
      }
    }

    this._modelGroups = groups;
    return groups;
  }

  get formattedKeywords(): string {
    return this.unit.keywords.join(", ");
  }

  formatDamage(damageMin: number, damageMax: number): string {
    if (damageMin === damageMax) return String(damageMin);
    if (damageMin === 1 && damageMax > 1) return `D${damageMax}`;
    return `${damageMin}-${damageMax}`;
  }

  formatAP(armorPiercing: number): string {
    return armorPiercing === 0 ? "0" : `-${armorPiercing}`;
  }

  private static getEquipmentSignature(equipment: Equipment[]): string {
    return [...equipment]
      .sort((a, b) => a.id - b.id)
      .map((e) => `${e.id}:${e.isDefault}`)
      .join(",");
  }
}
