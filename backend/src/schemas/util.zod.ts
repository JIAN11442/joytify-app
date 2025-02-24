import { z } from "zod";

const warningMsg = {
  objectIdCharater: {
    message: "parameter must be a 24 character of mongoose objectId",
  },
  codeCharater: {
    message:
      "code must be a capital letter followed by a dash and six digits (e.g., A-123456).",
  },
};

export const stringZodSchema = z.string().max(255);
export const fileUrlZodSchema = z.string().url();
export const objectIdZodSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, warningMsg.objectIdCharater);
export const emailZodSchema = z.string().email().min(1).max(255);
export const codeZodSchema = z.string().regex(/^[A-Z]-\d{6}$/);
