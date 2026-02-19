import { z } from "zod";

export const modelSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});
