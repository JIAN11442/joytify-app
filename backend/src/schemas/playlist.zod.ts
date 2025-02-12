import { z } from "zod";
import { stringZodSchema } from "./util.zod";

export const playlistZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
  description: stringZodSchema.optional(),
  imageUrl: stringZodSchema.optional(),
});

export type playlistZodSchemaType = z.infer<typeof playlistZodSchema>;
