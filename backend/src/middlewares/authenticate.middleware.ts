import { RequestHandler } from "express";

import { HttpCode, ErrorCode } from "@joytify/shared-types/constants";
import { AccessTokenSignOptions, verifyToken } from "../utils/jwt.util";
import appAssert from "../utils/app-assert.util";

const { UNAUTHORIZED } = HttpCode;
const { INVALID_ACCESS_TOKEN } = ErrorCode;

// authenticate middleware
const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // get access token from cookies
    const { accessToken } = req.cookies;

    appAssert(accessToken, UNAUTHORIZED, "Not authorized", INVALID_ACCESS_TOKEN);

    // if have access token, verify that
    const { payload, error } = await verifyToken(accessToken, {
      secret: AccessTokenSignOptions.secret,
    });

    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid token",
      INVALID_ACCESS_TOKEN
    );

    // save the payload to req
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;

    return next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
