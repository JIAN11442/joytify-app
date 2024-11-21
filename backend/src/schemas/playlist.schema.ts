import { z } from "zod";
import { stringSchema } from "./song.schema";

export const playlistSchema = z.object({
  title: stringSchema.min(1).optional(),
  description: stringSchema.optional(),
  imageUrl: stringSchema.optional(),
});
