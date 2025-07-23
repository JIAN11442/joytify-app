import { RequestHandler } from "express";
import { INTERNAL_API_KEY } from "../constants/env-validate.constant";
import { HttpCode } from "@joytify/shared-types/constants";
import appAssert from "../utils/app-assert.util";

const { UNAUTHORIZED } = HttpCode;

const apiKeyValidate: RequestHandler = (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = INTERNAL_API_KEY;

    appAssert(apiKey, UNAUTHORIZED, "API key is required");
    appAssert(expectedApiKey, UNAUTHORIZED, "Internal API key not configured");
    appAssert(apiKey === expectedApiKey, UNAUTHORIZED, "Invalid API key");

    req.internalApiKey = apiKey;

    return next();
  } catch (error) {
    next(error);
  }
};

export default apiKeyValidate;
