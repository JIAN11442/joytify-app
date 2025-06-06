import z from "zod";
import { LoopMode, SupportedLocale } from "@joytify/shared-types/constants";

export const userPreferencesCookieSchema = z.object({
  sidebarCollapsed: z.boolean().optional(),
  locale: z.nativeEnum(SupportedLocale).optional(),
  player: z
    .object({
      shuffle: z.boolean(),
      loop: z.nativeEnum(LoopMode),
      volume: z.union([
        z.literal(0),
        z.literal(0.1),
        z.literal(0.2),
        z.literal(0.3),
        z.literal(0.4),
        z.literal(0.5),
        z.literal(0.6),
        z.literal(0.7),
        z.literal(0.8),
        z.literal(0.9),
        z.literal(1),
      ]),
      playlistSongs: z.array(z.string()),
      playbackQueue: z.object({
        queue: z.array(z.string()),
        currentIndex: z.number(),
      }),
    })
    .optional(),
});
