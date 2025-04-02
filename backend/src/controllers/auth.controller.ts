import { RequestHandler } from "express";

import {
  createAccount,
  loginUser,
  loginUserWithThirdParty,
  logoutUser,
  refreshTokens,
  registerUserWithThirdParty,
} from "../services/auth.service";
import {
  firebaseAccessTokenZodSchema,
  loginZodSchema,
  registerZodSchema,
} from "../schemas/auth.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { RegisterRequest, LoginRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.util";

type RegisterParams = RegisterRequest & {
  userAgent?: string;
};

const { OK, CREATED, UNAUTHORIZED } = HttpCode;

// register handler
export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const request: RegisterParams = registerZodSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json(user);
  } catch (error) {
    next(error);
  }
};

// login handler
export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const request: LoginRequest = loginZodSchema.parse({
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

// logout handler
export const logoutHandler: RequestHandler = async (req, res, next) => {
  try {
    // get access token from cookies
    const { accessToken } = req.cookies;

    // logout user
    await logoutUser(accessToken);

    // clear cookies and return response
    return clearAuthCookies(res).status(OK).json({ message: "Logout successfully" });
  } catch (error) {
    next(error);
  }
};

// refresh tokens handler
export const refreshTokensHandler: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

    const { newAccessToken, newRefreshToken } = await refreshTokens(refreshToken);

    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
    }

    return res
      .cookie("accessToken", newAccessToken, getAccessTokenCookieOptions())
      .status(OK)
      .json({
        message: `Access token ${newRefreshToken ? "and refresh token are" : "is"} refreshed`,
      });
  } catch (error) {
    next(error);
  }
};

// third-party register handler
export const registerWithThirdPartyHandler: RequestHandler = async (req, res, next) => {
  try {
    // get firebase access token
    const { token } = firebaseAccessTokenZodSchema.parse(req.body);

    // register user with third party
    const { user, accessToken, refreshToken } = await registerUserWithThirdParty(token);

    return setAuthCookies({ res, refreshToken, accessToken }).status(CREATED).json(user);
  } catch (error) {
    next(error);
  }
};

// third-party login handler
export const loginWithThirdPartyHandler: RequestHandler = async (req, res, next) => {
  try {
    // get firebase access token
    const { token } = firebaseAccessTokenZodSchema.parse(req.body);

    // verify that to get user info
    const { accessToken, refreshToken } = await loginUserWithThirdParty(token);

    return setAuthCookies({ res, refreshToken, accessToken })
      .status(OK)
      .json({ message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};
