import { z } from "zod";
import { objectIdZodSchema, stringZodSchema } from "./util.zod";
import { PrivacyOptions } from "@joytify/shared-types/constants";

export const playlistZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
  description: stringZodSchema.optional(),
  coverImage: stringZodSchema.optional(),
  privacy: z.nativeEnum(PrivacyOptions).optional(),
  removedSongs: z.array(objectIdZodSchema).optional(),
});

export const createPlaylistZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
  description: stringZodSchema.optional(),
  coverImage: stringZodSchema.optional(),
  addedSongs: z.array(objectIdZodSchema).optional(),
});

export type playlistZodSchemaType = z.infer<typeof playlistZodSchema>;
