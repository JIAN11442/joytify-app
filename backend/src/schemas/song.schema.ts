import { z } from "zod";

export const stringSchema = z.string().min(0).max(255);
export const fileUrlSchema = z.string().url();

export const songSchema = z.object({
  title: stringSchema,
  artist: stringSchema,
  songUrl: fileUrlSchema,
  imageUrl: fileUrlSchema,
  songComposer: stringSchema.optional(),
  language: stringSchema.optional(),
  album: z.array(stringSchema).optional(),
  genre: z.array(stringSchema).optional(),
  tags: z.array(stringSchema).optional(),
  lyrics: z.array(stringSchema).optional(),
  releaseDate: z.union([z.date(), z.string().optional()]),
});

export type songSchemaType = z.infer<typeof songSchema>;
