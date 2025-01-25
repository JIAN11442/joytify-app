import { z } from "zod";
import { verificationCodeSchema } from "./auth.schema";

export const stringSchema = z.string().max(255);
export const fileUrlSchema = z.string().url();
export const arrayStringSchema = z.array(stringSchema);

export const songSchema = z.object({
  title: stringSchema,
  artist: z.array(stringSchema),
  songUrl: fileUrlSchema,
  playlist_for: verificationCodeSchema,
  duration: z.number(),
  imageUrl: fileUrlSchema.optional().nullable(),
  album: z.union([verificationCodeSchema, z.null()]).optional(),
  lyricists: z.array(verificationCodeSchema).optional().nullable(),
  composers: z.array(verificationCodeSchema).optional().nullable(),
  languages: z.array(verificationCodeSchema).optional().nullable(),
  genres: z.array(verificationCodeSchema).optional().nullable(),
  tags: z.array(verificationCodeSchema).optional().nullable(),
  lyrics: z.array(stringSchema).optional().nullable(),
  releaseDate: z.union([z.date(), z.string().optional().nullable()]),
});

export type SongSchemaType = z.infer<typeof songSchema>;
