import { z } from "zod";
import { stringSchema } from "./song.schema";
import MusicianOptions from "../constants/musician.constant";

export const musicianSchema = z.object({
  musicians: z.array(stringSchema),
  type: z.nativeEnum(MusicianOptions),
  createIfAbsent: z.boolean().optional(),
});
