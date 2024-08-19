import { RequestHandler } from "express";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "../schemas/auth.schema";
import {
  createAccount,
  loginUser,
  logoutUser,
  resetUserPassword,
  sendResetPasswordEmail,
  verifyEmail,
} from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.util";
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

// login handler
export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { accessToken, refreshToken } = await loginUser({
      ...request,
      req,
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({ message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};

// logout handler
export const logoutHandler: RequestHandler = async (req, res, next) => {
  try {
    // get access token from cookies
    const { accessToken } = req.cookies;

    // logout user
    await logoutUser(accessToken);

    // clear cookies and return response
    return clearAuthCookies(res)
      .status(OK)
      .json({ message: "Logout successfully" });
  } catch (error) {
    next(error);
  }
};

// forgot password handler
export const forgotPasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const email = emailSchema.parse(req.body.email);

    // verify email and send reset password email
    await sendResetPasswordEmail(email);

    return res.status(OK).json({ message: "Reset password email sent" });
  } catch (error) {
    next(error);
  }
};

// reset password handler
export const resetPasswordHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = resetPasswordSchema.parse(req.body);

    await resetUserPassword(request);

    return clearAuthCookies(res)
      .status(OK)
      .json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
