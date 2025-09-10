import { z } from "zod";
import { stringZodSchema } from "./util.zod";
import { MusicianOptions } from "@joytify/types/constants";

export const musicianZodSchema = z.object({
  musician: stringZodSchema,
  type: z.nativeEnum(MusicianOptions),
  createIfAbsent: z.coerce.boolean().optional(),
});

export const updateMusicianZodSchema = z.object({
  name: stringZodSchema.optional(),
  coverImage: stringZodSchema.optional(),
});

export type musicianZodSchemaType = z.infer<typeof musicianZodSchema>;
