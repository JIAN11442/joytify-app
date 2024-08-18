import { RequestHandler } from "express";
import {
  loginSchema,
  registerSchema,
  verificationCodeSchema,
} from "../schemas/auth.schema";
import {
  createAccount,
  loginUser,
  verifyEmail,
} from "../services/auth.service";
import { setAuthCookies } from "../utils/cookies.util";
import { CREATED, OK } from "../constants/http-code.constant";

// register handler
export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json(user);
  } catch (error) {
    next(error);
  }
};

// login handler
export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { accessToken, refreshToken } = await loginUser(request);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({ message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};

// verify email
export const verifyEmailHandler: RequestHandler = async (req, res, next) => {
  try {
    // verify verificationCode
    const code = verificationCodeSchema.parse(req.params.code);

    // verify email verified status
    await verifyEmail(code);

    return res.status(OK).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};
