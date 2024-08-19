import { z } from "zod";

// Warning messages
const warningMsg = {
  passwordCharater: {
    message:
      "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
  },
  verificationCodeCharater: {
    message: "Verification code must be a 24 character of mongoose objectId",
  },
  sessionIdCharater: {
    message: "Session id must be a 24 character of mongoose objectId",
  },
  passwordIsNotMatch: {
    path: ["confirmPassword"],
    message: "Password and confirm password must be same",
  },
};

// Items schema
export const emailSchema = z.string().email().min(1).max(255);

export const passwordSchema = z
  .string()
  .min(6, warningMsg.passwordCharater)
  .max(20, warningMsg.passwordCharater)
  .regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
    warningMsg.passwordCharater
  );

export const verificationCodeSchema = z
  .string()
  .length(24, warningMsg.verificationCodeCharater);

// Handler schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    warningMsg.passwordIsNotMatch
  );

export const resetPasswordSchema = z.object({
  verificationCode: verificationCodeSchema,
  password: passwordSchema,
});
