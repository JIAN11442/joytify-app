import { RequestHandler } from "express";

import {
  getVerifiedUserPreferencesCookie,
  updateUserPreferencesCookie,
} from "../services/cookie.service";
import { objectIdZodSchema } from "../schemas/util.zod";
import { userPreferencesCookieSchema } from "../schemas/cookie.zod";
import { HttpCode } from "@joytify/types/constants";
import { UpdateUserPreferencesCookieRequest } from "@joytify/types/types";
import { setUserPreferenceCookie } from "../utils/cookies.util";

const { OK } = HttpCode;

// get verified user preferences cookie payload handler
export const getUserPreferencesCookiePayloadHandler: RequestHandler = async (req, res, next) => {
  try {
    const { ui_prefs } = req.cookies;

    const { payload } = await getVerifiedUserPreferencesCookie({ cookie: ui_prefs, strict: false });

    res.status(OK).json(payload);
  } catch (error) {
    next(error);
  }
};

// update user preferences cookie payload handler
export const updateUserPreferencesCookiePayloadHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { ui_prefs } = req.cookies;

    const params: UpdateUserPreferencesCookieRequest = userPreferencesCookieSchema.parse(req.body);

    const { newCookie } = await updateUserPreferencesCookie({
      userId,
      cookie: ui_prefs,
      updatePayload: params,
    });

    return setUserPreferenceCookie({ res, ui_prefs: newCookie }).status(OK).json(newCookie);
  } catch (error) {
    next(error);
  }
};
