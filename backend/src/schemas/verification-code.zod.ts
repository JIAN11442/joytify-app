import { z } from "zod";
import { codeZodSchema, emailZodSchema, stringZodSchema } from "./util.zod";

export const defaultCodeZodSchema = z.object({
  email: emailZodSchema,
  token: stringZodSchema.optional(),
});

export const sendCodeZodSchema = defaultCodeZodSchema.extend({
  shouldResendCode: z.boolean(),
});

export const verifyCodeZodSchema = defaultCodeZodSchema.extend({
  code: codeZodSchema,
});
