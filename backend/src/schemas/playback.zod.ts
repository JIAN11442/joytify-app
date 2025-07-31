import { z } from "zod";
import { objectIdZodSchema } from "./util.zod";
import { PlaybackStateOptions } from "@joytify/shared-types/constants";

export const playbackZodSchema = z.object({
  songId: objectIdZodSchema,
  duration: z.number().min(0.001, "Duration must be greater than 0"),
  state: z.nativeEnum(PlaybackStateOptions),
});

export type playbackZodSchemaType = z.infer<typeof playbackZodSchema>;
