import { RequestHandler } from "express";
import { INTERNAL_API_KEY, ADMIN_API_KEY } from "../constants/env-validate.constant";
import { HttpCode } from "@joytify/types/constants";
import appAssert from "../utils/app-assert.util";

const { UNAUTHORIZED } = HttpCode;

export const internalApiKeyValidate: RequestHandler = (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = INTERNAL_API_KEY;

    appAssert(apiKey, UNAUTHORIZED, "Internal API key is required");
    appAssert(expectedApiKey, UNAUTHORIZED, "Internal API key not configured");
    appAssert(apiKey === expectedApiKey, UNAUTHORIZED, "Invalid internal API key");

    req.internalApiKey = apiKey;

    return next();
  } catch (error) {
    next(error);
  }
};

export const adminApiKeyValidate: RequestHandler = (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = ADMIN_API_KEY;

    appAssert(apiKey, UNAUTHORIZED, "Admin API key is required");
    appAssert(expectedApiKey, UNAUTHORIZED, "Admin API key not configured");
    appAssert(apiKey === expectedApiKey, UNAUTHORIZED, "Invalid admin API key");

    req.adminApiKey = apiKey;

    return next();
  } catch (error) {
    next(error);
  }
};
