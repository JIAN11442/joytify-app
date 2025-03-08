import { z } from "zod";
import { codeZodSchema, emailZodSchema, stringZodSchema } from "./util.zod";

export const sendLinkZodSchema = z.object({
  email: emailZodSchema,
});

export const sendCodeZodSchema = sendLinkZodSchema.extend({
  shouldResendCode: z.boolean(),
  token: stringZodSchema.optional(),
});

export const verifyCodeZodSchema = sendLinkZodSchema.extend({
  code: codeZodSchema,
});
