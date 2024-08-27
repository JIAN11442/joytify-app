import { RequestHandler } from "express";
import appAssert from "../utils/app-assert.util";
import { UNAUTHORIZED } from "../constants/http-code.constant";
import ErrorCode from "../constants/error-code.constant";
import { AccessTokenSignOptions, verifyToken } from "../utils/jwt.util";

const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // get access token from cookies
    const { accessToken } = req.cookies;

    appAssert(
      accessToken,
      UNAUTHORIZED,
      "Not authorized",
      ErrorCode.InvalidAccessToken
    );

    // if have access token, verify that
    const { payload, error } = await verifyToken(accessToken, {
      secret: AccessTokenSignOptions.secret,
    });

    appAssert(
      payload,
      UNAUTHORIZED,
      error === "jwt expired" ? "Token expired" : "Invalid token",
      ErrorCode.InvalidAccessToken
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
