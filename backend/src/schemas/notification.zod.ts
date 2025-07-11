import z from "zod";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { objectIdZodSchema, stringZodSchema } from "./util.zod";

export const createNotificationZodSchema = z.object({
  type: z.nativeEnum(NotificationTypeOptions),
  monthlyStatistics: z
    .array(
      z.object({
        user: stringZodSchema.optional(),
        stats: stringZodSchema.optional(),
        month: z.number().optional(),
        totalHours: z.number().optional(),
        growthPercentage: z.number().optional(),
        topArtist: stringZodSchema.optional(),
        topArtistTotalPlaybackTime: z.number().optional(),
      })
    )
    .optional(),
  followingArtistUpdate: z
    .object({
      artistId: objectIdZodSchema.optional(),
      artistName: stringZodSchema.optional(),
      songName: stringZodSchema.optional(),
      albumName: stringZodSchema.optional(),
    })
    .optional(),
  systemAnnouncement: z
    .object({
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
    .optional(),
});
