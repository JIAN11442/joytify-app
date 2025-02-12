import { z } from "zod";
import {
  stringZodSchema,
  fileUrlZodSchema,
  objectIdZodSchema,
} from "./util.zod";

export const songZodSchema = z.object({
  title: stringZodSchema,
  artist: z.array(stringZodSchema),
  songUrl: fileUrlZodSchema,
  playlist_for: objectIdZodSchema,
  duration: z.number(),
  imageUrl: fileUrlZodSchema.optional().nullable(),
  album: z.union([objectIdZodSchema, z.null()]).optional(),
  lyricists: z.array(objectIdZodSchema).optional().nullable(),
  composers: z.array(objectIdZodSchema).optional().nullable(),
  languages: z.array(objectIdZodSchema).optional().nullable(),
  genres: z.array(objectIdZodSchema).optional().nullable(),
  tags: z.array(objectIdZodSchema).optional().nullable(),
  lyrics: z.array(stringZodSchema).optional().nullable(),
  releaseDate: z.union([z.date(), z.string().optional().nullable()]),
});

export type SongZodSchemaType = z.infer<typeof songZodSchema>;
