import { z } from "zod";
import { objectIdZodSchema } from "./util.zod";
import { PlaybackStateOptions } from "@joytify/types/constants";
import { PLAYBACK_MIN_DURATION_SECONDS } from "../constants/env-validate.constant";

export const playbackZodSchema = z.object({
  songId: objectIdZodSchema,
  duration: z
    .number()
    .min(
      PLAYBACK_MIN_DURATION_SECONDS,
      `Duration must be greater than ${PLAYBACK_MIN_DURATION_SECONDS} seconds`
    ),
  state: z.nativeEnum(PlaybackStateOptions),
});

export type playbackZodSchemaType = z.infer<typeof playbackZodSchema>;
