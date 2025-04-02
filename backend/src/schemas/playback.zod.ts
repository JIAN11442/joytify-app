import { z } from "zod";
import { objectIdZodSchema } from "./util.zod";
import { PlaybackStateOptions } from "@joytify/shared-types/constants";

export const playbackZodSchema = z.object({
  songId: objectIdZodSchema,
  duration: z.number(),
  state: z.nativeEnum(PlaybackStateOptions),
  timestamp: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date()),
});

export type playbackZodSchemaType = z.infer<typeof playbackZodSchema>;
