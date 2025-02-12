import { RequestHandler } from "express";

import UserModel from "../models/user.model";
import appAssert from "../utils/app-assert.util";
import { objectIdZodSchema } from "../schemas/util.zod";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../constants/http-code.constant";

// get user handler
export const getUserHandler: RequestHandler = async (req, res, next) => {
  try {
    // check user id
    const userId = objectIdZodSchema.parse(req.userId);

    // find user by id
    const user = await UserModel.findById(userId);

    appAssert(user, NOT_FOUND, "User not found");

    return res.status(OK).json(user.omitPassword());
  } catch (error) {
    next(error);
  }
};

// deregister user handler
export const deregisterUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    appAssert(
      deletedUser,
      INTERNAL_SERVER_ERROR,
      "Failed to deregiter user account"
    );

    return res
      .status(OK)
      .json({ message: "Deregister user account successfully" });
  } catch (error) {
    next(error);
  }
};
