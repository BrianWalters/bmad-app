import type { FormField } from "./field";
import { unitSchema } from "@/data/validation/unit";
import { slugify } from "@/data/orm/slugify";
import {
  createUnit,
  getUnitById,
  getKeywordsForUnit,
  updateUnit,
  isSlugAvailable,
} from "@/data/repo/unit-repository";

export class UnitForm {
  private id?: number;
  private formData: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private unitExists = true;

  constructor(id?: number) {
    this.id = id;

    if (id !== undefined) {
      const existing = getUnitById(id);
      if (!existing) {
        this.unitExists = false;
        return;
      }

      const keywords = getKeywordsForUnit(id);

      this.formData = {
        name: existing.name,
        movement: String(existing.movement),
        toughness: String(existing.toughness),
        save: String(existing.save),
        wounds: String(existing.wounds),
        leadership: String(existing.leadership),
        objectiveControl: String(existing.objectiveControl),
        invulnerabilitySave: existing.invulnerabilitySave != null ? String(existing.invulnerabilitySave) : "",
        description: existing.description ?? "",
        keywords: keywords.join(", "),
      };
    }
  }

  isEditMode(): boolean {
    return this.id !== undefined;
  }

  exists(): boolean {
    return this.unitExists;
  }

  getFields(): Array<FormField> {
    return [
      { name: "name", label: "Name", required: true, type: "text", value: this.formData.name ?? null },
      { name: "movement", label: "Movement", required: true, type: "number", value: this.formData.movement ?? null },
      { name: "toughness", label: "Toughness", required: true, type: "number", value: this.formData.toughness ?? null },
      { name: "save", label: "Save", required: true, type: "number", value: this.formData.save ?? null },
      { name: "wounds", label: "Wounds", required: true, type: "number", value: this.formData.wounds ?? null },
      { name: "leadership", label: "Leadership", required: true, type: "number", value: this.formData.leadership ?? null },
      { name: "objectiveControl", label: "Objective Control", required: true, type: "number", value: this.formData.objectiveControl ?? null },
      { name: "invulnerabilitySave", label: "Invulnerability Save", required: false, type: "number", value: this.formData.invulnerabilitySave ?? null },
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
      movement: data.get("movement")?.toString() ?? "",
      toughness: data.get("toughness")?.toString() ?? "",
      save: data.get("save")?.toString() ?? "",
      wounds: data.get("wounds")?.toString() ?? "",
      leadership: data.get("leadership")?.toString() ?? "",
      objectiveControl: data.get("objectiveControl")?.toString() ?? "",
      invulnerabilitySave: data.get("invulnerabilitySave")?.toString() ?? "",
      description: data.get("description")?.toString() ?? "",
      keywords: data.get("keywords")?.toString() ?? "",
    };

    this.formData = raw;

    const parsed = unitSchema.safeParse(raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !this.errors[field]) {
          this.errors[field] = issue.message;
        }
      }
      return false;
    }

    const slug = slugify(parsed.data.name);

    if (!isSlugAvailable(slug, this.id)) {
      this.errors.name = "A unit with a similar name already exists. Please choose a different name.";
      return false;
    }

    if (this.id !== undefined) {
      updateUnit(this.id, { ...parsed.data, slug });
    } else {
      createUnit({ ...parsed.data, slug });
    }

    return true;
  }
}
