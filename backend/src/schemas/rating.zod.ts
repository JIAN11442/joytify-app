import z from "zod";
import { objectIdZodSchema } from "./util.zod";

export const upsertRatingZodSchema = z.object({
  songId: objectIdZodSchema.optional(),
  songDuration: z.number().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const upsertSongRatingZodSchema = upsertRatingZodSchema.extend({
  liked: z.boolean(),
});
