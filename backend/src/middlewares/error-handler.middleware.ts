import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";

import { AppError } from "@joytify/shared-types/classes";
import { HttpCode, ErrorCode } from "@joytify/shared-types/constants";
import { clearAuthCookies, cookiePath, setUnauthorizedCookies } from "../utils/cookies.util";
import { deleteAwsFileUrl } from "../utils/aws-s3-url.util";
import awsUrlParser from "../utils/aws-url-parser.util";
import admin from "../config/firebase.config";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = HttpCode;
const { INVALID_FIREBASE_CREDENTIAL, CREATE_SONG_ERROR } = ErrorCode;

const errorHandler = (): ErrorRequestHandler => {
  return async (error, req, res, next) => {
    // clear the cookies while refresh path throws an error
    if (req.path === cookiePath) {
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
      // if unauthorized, set the unauthorized cookies
      if (error.statusCode === UNAUTHORIZED) {
        if (!req.cookies.unauthorized) {
          setUnauthorizedCookies({ res, redirectUrl: req.originalUrl });
        }
      }

      // If firebase auth with third-party provider fails, delete the firebase user
      // to avoid another provider with the same email can't auth again
      if (error.errorCode?.valueOf() === INVALID_FIREBASE_CREDENTIAL) {
        if (error.firebaseUID) {
          await admin.auth().deleteUser(error.firebaseUID);
        }
      }

      // if get error from create song API, delete url file from AWS
      if (error.errorCode?.valueOf() === CREATE_SONG_ERROR && error.awsUrl?.length) {
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
