import assert from "node:assert";

import AppError from "./app-error.util";
import { HttpStatusCode } from "../constants/http-code.constant";
import ErrorCode from "../constants/error-code.constant";

type AppAssertParams = (
  condition: any,
  statusCode: HttpStatusCode,
  message: string,
  errorCode?: ErrorCode,
  firebaseUID?: string | null,
  awsUrl?: string[] | null
) => asserts condition;

const appAssert: AppAssertParams = (
  condition,
  statusCode,
  message,
  errorCode,
  firebaseUID,
  awsUrl
) => {
  return assert(
    condition,
    new AppError(statusCode, message, errorCode, firebaseUID, awsUrl)
  );
};

export default appAssert;
