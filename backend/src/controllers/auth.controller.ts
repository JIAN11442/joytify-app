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
import { HttpCode } from "@joytify/types/constants";
import { RegisterRequest, LoginRequest } from "@joytify/types/types";
import appAssert from "../utils/app-assert.util";
import {
  clearAuthCookies,
  clearUnauthorizedCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.util";

const { OK, CREATED, NO_CONTENT, BAD_REQUEST } = HttpCode;

// register handler
export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const request: RegisterRequest = registerZodSchema.parse(req.body);

    const { user, accessToken, refreshToken, ui_prefs } = await createAccount(request);

    return setAuthCookies({ res, accessToken, refreshToken, ui_prefs }).status(CREATED).json(user);
  } catch (error) {
    next(error);
  }
};

// login handler
export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const request: LoginRequest = loginZodSchema.parse(req.body);

    const { accessToken, refreshToken, ui_prefs } = await loginUser(request);

    return setAuthCookies({ res, accessToken, refreshToken, ui_prefs })
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
    return clearAuthCookies(res).status(NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

// refresh tokens handler
export const refreshTokensHandler: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    appAssert(refreshToken, BAD_REQUEST, "Missing refresh token");

    const { newAccessToken, newRefreshToken } = await refreshTokens(refreshToken);

    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
    }

    return clearUnauthorizedCookies(res)
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
    const { token, sessionInfo } = firebaseAccessTokenZodSchema.parse(req.body);

    // register user with third party
    const { user, accessToken, refreshToken, ui_prefs } = await registerUserWithThirdParty({
      token,
      sessionInfo,
    });

    return setAuthCookies({ res, refreshToken, accessToken, ui_prefs }).status(CREATED).json(user);
  } catch (error) {
    next(error);
  }
};

// third-party login handler
export const loginWithThirdPartyHandler: RequestHandler = async (req, res, next) => {
  try {
    // get firebase access token
    const { token, sessionInfo } = firebaseAccessTokenZodSchema.parse(req.body);

    // verify that to get user info
    const { accessToken, refreshToken, ui_prefs } = await loginUserWithThirdParty({
      token,
      sessionInfo,
    });

    return setAuthCookies({ res, refreshToken, accessToken, ui_prefs })
      .status(OK)
      .json({ message: "Login successfully" });
  } catch (error) {
    next(error);
  }
};
