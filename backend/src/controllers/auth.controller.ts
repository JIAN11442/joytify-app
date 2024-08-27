import { RequestHandler } from "express";
import {
  emailSchema,
  firebaseAccessTokenSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "../schemas/auth.schema";
import {
  createAccount,
  loginUser,
  loginUserWithThirdParty,
  logoutUser,
  refreshTokens,
  registerUserWithThirdParty,
  resetUserPassword,
  sendResetPasswordEmail,
  verifyEmail,
} from "../services/auth.service";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.util";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";

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

// refresh tokens handler
export const refreshTokensHandler: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

    const { newAccessToken, newRefreshToken } = await refreshTokens(
      refreshToken
    );

    if (newRefreshToken) {
      res.cookie(
        "refreshToken",
        newRefreshToken,
        getRefreshTokenCookieOptions()
      );
    }

    return res
      .cookie("accessToken", newAccessToken, getAccessTokenCookieOptions())
      .status(OK)
      .json({
        message: `Access token ${
          newRefreshToken ? "and refresh token are" : "is"
        } refreshed`,
      });
  } catch (error) {
    next(error);
  }
};

// third-party login handler
export const loginWithThirdPartyHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // get firebase access token
    const firebaseAccessToken = firebaseAccessTokenSchema.parse(req.body.token);

    // verify that to get user info
    const { accessToken, refreshToken } = await loginUserWithThirdParty(
      firebaseAccessToken
    );

    return setAuthCookies({ res, refreshToken, accessToken })
      .status(OK)
      .json({ message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};

// third-party register handler
export const registerWithThirdPartyHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // get firebase access token
    const firebaseAccessToken = firebaseAccessTokenSchema.parse(req.body.token);

    const { user, accessToken, refreshToken } =
      await registerUserWithThirdParty(firebaseAccessToken);

    return setAuthCookies({ res, refreshToken, accessToken })
      .status(CREATED)
      .json(user);
  } catch (error) {
    next(error);
  }
};
