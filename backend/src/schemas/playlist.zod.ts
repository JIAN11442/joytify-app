import { z } from "zod";
import { stringZodSchema } from "./util.zod";
import { PrivacyOptions } from "@joytify/shared-types/constants";

export const playlistZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
  description: stringZodSchema.optional(),
  cover_image: stringZodSchema.optional(),
  privacy: z.nativeEnum(PrivacyOptions).optional(),
});

export const createPlaylistZodSchema = z.object({
  title: stringZodSchema.min(1).optional(),
});

export type playlistZodSchemaType = z.infer<typeof playlistZodSchema>;
