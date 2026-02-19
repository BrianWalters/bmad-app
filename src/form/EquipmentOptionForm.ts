import type { FormField } from "@/form/field";
import { equipmentOptionSchema } from "@/data/validation/equipment-option";
import {
  createEquipmentOptionForModel,
  getEquipmentOptionById,
  updateEquipmentOption,
  isEquipmentOptionAssociatedWithModel,
} from "@/data/repo/equipment-option-repository";

export class EquipmentOptionForm {
  private modelId: number;
  private equipmentOptionId?: number;
  private formData: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private optionExists = true;

  constructor(modelId: number, equipmentOptionId?: number) {
    this.modelId = modelId;
    this.equipmentOptionId = equipmentOptionId;

    if (equipmentOptionId !== undefined) {
      const existing = getEquipmentOptionById(equipmentOptionId);
      if (
        !existing ||
        !isEquipmentOptionAssociatedWithModel(modelId, equipmentOptionId)
      ) {
        this.optionExists = false;
        return;
      }

      this.formData = {
        name: existing.name,
        range: String(existing.range),
        attacks: String(existing.attacks),
        skill: String(existing.skill),
        strength: String(existing.strength),
        armorPiercing: String(existing.armorPiercing),
        damageMin: String(existing.damageMin),
        damageMax: String(existing.damageMax),
      };
    }
  }

  getModelId(): number {
    return this.modelId;
  }

  isEditMode(): boolean {
    return this.equipmentOptionId !== undefined;
  }

  exists(): boolean {
    return this.optionExists;
  }

  getFields(): Array<FormField> {
    return [
      { name: "name", label: "Name", required: true, type: "text", value: this.formData.name ?? null },
      { name: "range", label: "Range", required: false, type: "number", value: this.formData.range ?? null, min: 0 },
      { name: "attacks", label: "Attacks", required: true, type: "number", value: this.formData.attacks ?? null, min: 1 },
      { name: "skill", label: "BS/WS", required: true, type: "number", value: this.formData.skill ?? null, min: 1 },
      { name: "strength", label: "Strength", required: true, type: "number", value: this.formData.strength ?? null, min: 1 },
      { name: "armorPiercing", label: "Armor Piercing", required: false, type: "number", value: this.formData.armorPiercing ?? null, min: 0 },
      { name: "damageMin", label: "Damage Min", required: false, type: "number", value: this.formData.damageMin ?? null, min: 1 },
      { name: "damageMax", label: "Damage Max", required: false, type: "number", value: this.formData.damageMax ?? null, min: 1 },
    ];
  }

  getValue(name: string): string | null {
    return this.formData[name] ?? null;
  }

  getErrors(): Record<string, string> {
    return this.errors;
  }

  handleForm(data: FormData): boolean {
    const raw: Record<string, string> = {
      name: data.get("name")?.toString() ?? "",
      range: data.get("range")?.toString() ?? "",
      attacks: data.get("attacks")?.toString() ?? "",
      skill: data.get("skill")?.toString() ?? "",
      strength: data.get("strength")?.toString() ?? "",
      armorPiercing: data.get("armorPiercing")?.toString() ?? "",
      damageMin: data.get("damageMin")?.toString() ?? "",
      damageMax: data.get("damageMax")?.toString() ?? "",
    };

    this.formData = raw;

    const parsed = equipmentOptionSchema.safeParse(raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !this.errors[field]) {
          this.errors[field] = issue.message;
        }
      }
      return false;
    }

    if (this.equipmentOptionId !== undefined) {
      updateEquipmentOption(this.equipmentOptionId, parsed.data);
    } else {
      createEquipmentOptionForModel(this.modelId, parsed.data);
    }

    return true;
  }
}
