import { RequestHandler } from "express";

import { HttpCode } from "@joytify/types/constants";
import appAssert from "../utils/app-assert.util";
import admin from "../config/firebase.config";

const { INTERNAL_SERVER_ERROR } = HttpCode;

const firebaseInitialize = (): RequestHandler => {
  return (req, res, next) => {
    try {
      appAssert(admin.apps.length > 0, INTERNAL_SERVER_ERROR, "Firebase initialization failed");

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default firebaseInitialize;
