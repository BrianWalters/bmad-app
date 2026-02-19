import { z } from "zod";

export const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ModelInput = z.infer<typeof modelSchema>;
