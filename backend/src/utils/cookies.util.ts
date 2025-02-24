import { CookieOptions, Response } from "express";
import { NODE_ENV, USE_NGINX_PROXY } from "../constants/env-validate.constant";
import {
  fifteenMinutesFromNow,
  tenMinutesFromNow,
  thirtyDaysFormNow,
} from "./date.util";

type AuthCookiesParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

type VerificationCookiesParams = {
  res: Response;
  sessionToken: string;
};

const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: secure ? "strict" : "lax",
  httpOnly: secure,
  secure,
};

export const cookiePath = `${USE_NGINX_PROXY ? "/api" : ""}/auth/refresh`;

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFormNow(),
  path: cookiePath, // only in this path can get the token
});

export const getVerificationCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: tenMinutesFromNow(),
});

// save cookies
export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: AuthCookiesParams) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const setVerificationCookies = ({
  res,
  sessionToken,
}: VerificationCookiesParams) => {
  return res.cookie("vrfctToken", sessionToken, getVerificationCookieOptions());
};

// clear cookies
export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: cookiePath });
};

export const clearVerificationCookies = (res: Response) => {
  return res.clearCookie("verificationSessionToken");
};
