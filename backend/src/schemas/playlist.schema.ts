import { z } from "zod";

export const playlistSchame = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});
