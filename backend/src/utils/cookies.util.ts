import { CookieOptions, Response } from "express";
import { NODE_ENV, USE_NGINX_PROXY } from "../constants/env-validate.constant";
import {
  fifteenMinutesFromNow,
  oneDayFromNow,
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

type UnauthorizedCookiesParams = {
  res: Response;
  redirectUrl: string;
};

// ===================== Default =====================

const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: secure ? "strict" : "lax",
  httpOnly: secure,
  secure,
};

export const cookiePath = `${USE_NGINX_PROXY ? "/api" : ""}/auth/refresh`;

// ===================== Cookies Options =====================

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFormNow(),
  path: cookiePath, // only in this path can get the token
});

export const getUnauthorizedCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: oneDayFromNow(),
});

export const getVerificationCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: tenMinutesFromNow(),
});

// ===================== Set Cookies =====================
export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: AuthCookiesParams) => {
  return clearUnauthorizedCookies(res)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const setUnauthorizedCookies = ({
  res,
  redirectUrl,
}: UnauthorizedCookiesParams) => {
  return res.cookie(
    "unauthorized",
    redirectUrl,
    getUnauthorizedCookieOptions()
  );
};

export const setVerificationCookies = ({
  res,
  sessionToken,
}: VerificationCookiesParams) => {
  return res.cookie("vrfctToken", sessionToken, getVerificationCookieOptions());
};

// ===================== Clear Cookies =====================
export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: cookiePath });
};

export const clearUnauthorizedCookies = (res: Response) => {
  return res.clearCookie("unauthorized");
};

export const clearVerificationCookies = (res: Response) => {
  return res.clearCookie("vrfctToken");
};
