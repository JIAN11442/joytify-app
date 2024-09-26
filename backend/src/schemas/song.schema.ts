import { z } from "zod";
import { verificationCodeSchema } from "./auth.schema";

export const stringSchema = z.string().min(0).max(255);
export const fileUrlSchema = z.string().url();

export const songSchema = z.object({
  title: stringSchema,
  artist: stringSchema,
  songUrl: fileUrlSchema,
  imageUrl: fileUrlSchema,
  duration: z.number(),
  playlist_for: verificationCodeSchema,
  album: verificationCodeSchema.optional().nullable(),
  composer: z.array(stringSchema).optional().nullable(),
  language: z.array(verificationCodeSchema).optional().nullable(),
  genre: z.array(verificationCodeSchema).optional().nullable(),
  tags: z.array(verificationCodeSchema).optional().nullable(),
  lyrics: z.array(stringSchema).optional().nullable(),
  releaseDate: z.union([z.date(), z.string().optional().nullable()]),
});

export type songSchemaType = z.infer<typeof songSchema>;
