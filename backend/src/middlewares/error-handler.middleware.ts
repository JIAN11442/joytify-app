import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";

import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "../constants/http-code.constant";
import AppError from "../utils/app-error.util";

const ErrorHandler: ErrorRequestHandler = async (error, req, res, next) => {
  // Zod  Error
  if (error instanceof ZodError) {
    const errors = error.issues.map((err) => ({
      path: err.path,
      message: err.message,
    }));

    return res.status(BAD_REQUEST).json(errors[0]);
  }

  // App Error
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ message: error.message, errorCode: error.errorCode });
  }

  // Other errors
  console.log(`PATH: ${req.path}\n\n`, error);

  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default ErrorHandler;
