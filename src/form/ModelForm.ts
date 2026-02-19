import type { FormField } from "./field";
import { modelSchema } from "@/data/validation/model";
import {
  createModel,
  getModelById,
  updateModel,
} from "@/data/repo/model-repository";

export class ModelForm {
  private unitId: number;
  private modelId?: number;
  private formData: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private modelExists = true;

  constructor(unitId: number, modelId?: number) {
    this.unitId = unitId;
    this.modelId = modelId;

    if (modelId !== undefined) {
      const existing = getModelById(modelId);
      if (!existing) {
        this.modelExists = false;
        return;
      }

      this.formData = {
        name: existing.name,
      };
    }
  }

  getUnitId(): number {
    return this.unitId;
  }

  isEditMode(): boolean {
    return this.modelId !== undefined;
  }

  exists(): boolean {
    return this.modelExists;
  }

  getFields(): Array<FormField> {
    return [
      { name: "name", label: "Name", required: true, type: "text", value: this.formData.name ?? null },
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
    };

    this.formData = raw;

    const parsed = modelSchema.safeParse(raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !this.errors[field]) {
          this.errors[field] = issue.message;
        }
      }
      return false;
    }

    if (this.modelId !== undefined) {
      updateModel(this.modelId, parsed.data);
    } else {
      createModel(this.unitId, parsed.data);
    }

    return true;
  }
}
