import { z } from "zod";
import { stringZodSchema, objectIdZodSchema } from "./util.zod";

export const albumZodSchema = z.object({
  title: stringZodSchema.min(1),
  description: stringZodSchema.optional(),
  coverImage: stringZodSchema.optional(),
  artists: z.array(objectIdZodSchema).optional(),
});

export const updateAlbumZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
  coverImage: stringZodSchema.optional(),
});

export type AlbumZodSchemaType = z.infer<typeof albumZodSchema>;
