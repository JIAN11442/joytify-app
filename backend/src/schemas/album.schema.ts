import { z } from "zod";
import { stringSchema } from "./song.schema";
import { verificationCodeSchema } from "./auth.schema";

export const albumSchema = z.object({
  title: stringSchema.min(1),
  description: stringSchema.optional(),
  cover_image: stringSchema.optional(),
  artist: verificationCodeSchema.optional(),
});
