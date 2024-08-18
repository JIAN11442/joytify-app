import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env-validate.constant";
import { fifteenMinutesFromNow, thirtyDaysFormNow } from "./date.util";

type CookiesParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFormNow(),
  path: "/auth/refresh", // only in this path can get the token
});

// save cookies
export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: CookiesParams) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

// clear cookies
export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: "/auth/refresh" });
};
