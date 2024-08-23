import { z } from "zod";

export const awsSignedSchema = z.object({
  subfolder: z.enum(["songs", "images"]).optional(),
  extension: z.enum([".png", ".jpeg", ".jpg", ".mp3", ".gif"]),
});
