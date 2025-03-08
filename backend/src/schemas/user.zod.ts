import { z } from "zod";
import { passwordZodSchema } from "./auth.zod";

export const resetPasswordZodSchema = z.object({
  currentPassword: passwordZodSchema,
  newPassword: passwordZodSchema,
});
