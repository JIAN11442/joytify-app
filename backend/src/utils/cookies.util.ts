import { CookieOptions, Response } from "express";
import { NODE_ENV, USE_NGINX_PROXY } from "../constants/env-validate.constant";
import { API_ENDPOINTS } from "@joytify/types/constants";
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
  ui_prefs: string;
};

type VerificationCookiesParams = {
  res: Response;
  sessionToken: string;
};

type UnauthorizedCookiesParams = {
  res: Response;
  redirectUrl: string;
};

type UserPreferenceCookieParams = {
  res: Response;
  ui_prefs: string;
};

// ===================== Default =====================

const secure = NODE_ENV !== "development";

const { AUTH } = API_ENDPOINTS;

const defaults: CookieOptions = {
  sameSite: secure ? "strict" : "lax",
  httpOnly: secure,
  secure,
};

export const refreshCookiePath = `${USE_NGINX_PROXY ? "/api/v1" : ""}${AUTH}/refresh`;

// ===================== Cookies Options =====================

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFormNow(),
  path: refreshCookiePath, // only in this path can get the token
});

export const getUnauthorizedCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: oneDayFromNow(),
});

export const getVerificationCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: tenMinutesFromNow(),
});

export const getUserPreferenceCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFormNow(),
});

// ===================== Set Cookies =====================

export const setAuthCookies = ({ res, accessToken, refreshToken, ui_prefs }: AuthCookiesParams) => {
  return clearUnauthorizedCookies(res)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
    .cookie("ui_prefs", ui_prefs, getUserPreferenceCookieOptions());
};

export const setUnauthorizedCookies = ({ res, redirectUrl }: UnauthorizedCookiesParams) => {
  return res.cookie("unauthorized", redirectUrl, getUnauthorizedCookieOptions());
};

export const setVerificationCookies = ({ res, sessionToken }: VerificationCookiesParams) => {
  return res.cookie("vrfctToken", sessionToken, getVerificationCookieOptions());
};

export const setUserPreferenceCookie = ({ res, ui_prefs }: UserPreferenceCookieParams) => {
  return res.cookie("ui_prefs", ui_prefs, getUserPreferenceCookieOptions());
};

// ===================== Clear Cookies =====================

export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: refreshCookiePath })
    .clearCookie("ui_prefs");
};

export const clearUnauthorizedCookies = (res: Response) => {
  return res.clearCookie("unauthorized");
};

export const clearVerificationCookies = (res: Response) => {
  return res.clearCookie("vrfctToken");
};
