import { z } from "zod";
import { emailZodSchema, objectIdZodSchema, stringZodSchema } from "./util.zod";

// Warning messages
const warningMsg = {
  passwordCharater: {
    message:
      "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
  },
  sessionIdCharater: {
    message: "Session id must be a 24 character of mongoose objectId",
  },
  passwordIsNotMatch: {
    path: ["confirmPassword"],
    message: "Password and confirm password must be same",
  },
  firebaseAccessTokenCharater: {
    path: ["firebaseAccessToken"],
    message: "Firebase access token is required",
  },
};

// Items schema

export const passwordZodSchema = z
  .string()
  .min(6, warningMsg.passwordCharater)
  .max(20, warningMsg.passwordCharater)
  .regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
    warningMsg.passwordCharater
  );

// Handler schema
export const loginZodSchema = z.object({
  email: emailZodSchema,
  password: passwordZodSchema.optional(),
  userAgent: stringZodSchema.optional(),
});

export const registerZodSchema = loginZodSchema
  .extend({ confirmPassword: passwordZodSchema })
  .refine(
    (data) => data.password === data.confirmPassword,
    warningMsg.passwordIsNotMatch
  );

export const resetPasswordZodSchema = z.object({
  verificationCode: objectIdZodSchema,
  password: passwordZodSchema,
});

export const firebaseAccessTokenZodSchema = z
  .string()
  .min(1, warningMsg.firebaseAccessTokenCharater);
