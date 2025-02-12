import { z } from "zod";
import { objectIdZodSchema } from "./util.zod";
import PlaybackStateOptions from "../constants/playback.constant";

export const playbackZodSchema = z.object({
  songId: objectIdZodSchema,
  duration: z.number(),
  state: z.enum([PlaybackStateOptions.COMPLETED, PlaybackStateOptions.PLAYING]),
  timestamp: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date()),
});

export type playbackZodSchemaType = z.infer<typeof playbackZodSchema>;
