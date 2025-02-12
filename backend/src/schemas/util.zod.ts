import { z } from "zod";

const warningMsg = {
  objectIdCharater: {
    message: "parameter must be a 24 character of mongoose objectId",
  },
};

export const stringZodSchema = z.string().max(255);
export const fileUrlZodSchema = z.string().url();
export const objectIdZodSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, warningMsg.objectIdCharater);
