import { z } from "zod";
import { stringZodSchema, fileUrlZodSchema, objectIdZodSchema } from "./util.zod";

export const songZodSchema = z.object({
  title: stringZodSchema,
  artist: objectIdZodSchema,
  songUrl: fileUrlZodSchema,
  playlistFor: objectIdZodSchema,
  duration: z.number(),
  imageUrl: fileUrlZodSchema.optional(),
  album: objectIdZodSchema.optional(),
  lyricists: z.array(objectIdZodSchema).optional(),
  composers: z.array(objectIdZodSchema).optional(),
  languages: z.array(objectIdZodSchema).optional(),
  genres: z.array(objectIdZodSchema).optional(),
  tags: z.array(objectIdZodSchema).optional(),
  lyrics: z.array(stringZodSchema).optional(),
  releaseDate: z.string().optional(),
});

export const updateSongInfoZodSchema = z.object({
  title: stringZodSchema.optional(),
  imageUrl: fileUrlZodSchema.optional(),
});

export const deleteSongZodSchema = z.object({
  shouldDeleteSongs: z.boolean(),
});

export const updateSongPlaylistsZodSchema = z.object({
  playlistsToAdd: z.array(objectIdZodSchema),
  playlistsToRemove: z.array(objectIdZodSchema),
});

export type SongZodSchemaType = z.infer<typeof songZodSchema>;
