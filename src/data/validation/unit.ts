import { z } from "zod";

const nonEmpty = z.string().min(1);
const optionalString = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().optional(),
);

const requiredInt = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number({ required_error: "Required", invalid_type_error: "Must be a number" }).int({ message: "Must be a whole number" }),
);

const optionalInt = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number({ invalid_type_error: "Must be a number" }).int({ message: "Must be a whole number" }).optional(),
);

export const unitSchema = z.object({
  name: nonEmpty,
  movement: requiredInt,
  toughness: requiredInt,
  save: requiredInt,
  wounds: requiredInt,
  leadership: nonEmpty,
  objectiveControl: requiredInt,
  invulnerabilitySave: requiredInt,
  description: optionalString,
  keywords: optionalString,
});

export type UnitInput = z.infer<typeof unitSchema>;
