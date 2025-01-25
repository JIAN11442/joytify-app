import { z } from "zod";
import { verificationCodeSchema } from "./auth.schema";
import PlaybackStateOptions from "../constants/playback.constant";

export const playbackLogSchema = z.object({
  songId: verificationCodeSchema,
  duration: z.number(),
  state: z.enum([PlaybackStateOptions.COMPLETED, PlaybackStateOptions.PLAYING]),
  timestamp: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date()),
});

export type PlaybackLogSchemaType = z.infer<typeof playbackLogSchema>;
