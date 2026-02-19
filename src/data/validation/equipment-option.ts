import { z } from "zod";

export const equipmentOptionSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    range: z.coerce.number().int().min(0, "Range must be 0 or greater").default(0),
    attacks: z.coerce.number().int().min(1, "Attacks must be at least 1"),
    skill: z.coerce.number().int().min(1, "Skill must be at least 1"),
    strength: z.coerce.number().int().min(1, "Strength must be at least 1"),
    armorPiercing: z.coerce.number().int().min(0, "Armor Piercing must be 0 or greater").default(0),
    damageMin: z.coerce.number().int().min(1, "Damage Min must be at least 1").default(1),
    damageMax: z.coerce.number().int().min(1, "Damage Max must be at least 1").default(1),
  })
  .refine((data) => data.damageMax >= data.damageMin, {
    message: "Damage Max must be greater than or equal to Damage Min",
    path: ["damageMax"],
  });
