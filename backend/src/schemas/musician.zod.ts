import { z } from "zod";
import { stringZodSchema } from "./util.zod";
import MusicianOptions from "../constants/musician.constant";

export const musicianZodSchema = z.object({
  musicians: z.array(stringZodSchema),
  type: z.nativeEnum(MusicianOptions),
  createIfAbsent: z.boolean().optional(),
});

export type musicianZodSchemaType = z.infer<typeof musicianZodSchema>;
