import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";

import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "../constants/http-code.constant";
import AppError from "../utils/app-error.util";
import { clearAuthCookies } from "../utils/cookies.util";
import admin from "../config/firebase.config";
import { deleteAwsFileUrl } from "../utils/aws-s3-url.util";
import awsUrlParser from "../utils/aws-url-parser.util";

const errorHandler = (): ErrorRequestHandler => {
  return async (error, req, res, next) => {
    // clear the cookies while refresh path throws an error
    if (req.path === "/auth/refresh") {
      clearAuthCookies(res);
    }

    // Zod  Error
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => ({
        path: err.path,
        message: err.message,
      }));

      console.log(errors[0]);

      return res.status(BAD_REQUEST).json(errors[0]);
    }

    // Auth Error
    if (error?.errorInfo?.code && error.errorInfo.code.startsWith("auth/")) {
      return res.status(BAD_REQUEST).json({
        code: error.errorInfo.code,
        message: error.errorInfo.message,
      });
    }

    // App Error
    if (error instanceof AppError) {
      // If firebase auth with third-party provider fails, delete the firebase user
      // to avoid another provider with the same email can't auth again
      if (error.errorCode === "InvalidFirebaseCredential") {
        if (error.firebaseUID) {
          await admin.auth().deleteUser(error.firebaseUID);
        }
      }

      // if get error from create song API, delete url file from AWS
      if (error.errorCode === "CreateSongError" && error.awsUrl?.length) {
        const urls = error.awsUrl;

        for (const url of urls) {
          // parse url to get key
          const { awsS3Key } = awsUrlParser(url);

          // delete it from AWS
          await deleteAwsFileUrl(awsS3Key);
        }
      }

      return res
        .status(error.statusCode)
        .json({ message: error.message, errorCode: error.errorCode });
    }

    // Other errors
    console.log(`PATH: ${req.path}\n\n`, error);

    return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
  };
};

export default errorHandler;
