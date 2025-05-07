import { z } from "zod";
import { stringZodSchema, objectIdZodSchema } from "./util.zod";

export const albumZodSchema = z.object({
  title: stringZodSchema.min(1),
  description: stringZodSchema.optional(),
  coverImage: stringZodSchema.optional(),
  artist: objectIdZodSchema.optional(),
});

export type AlbumZodSchemaType = z.infer<typeof albumZodSchema>;
