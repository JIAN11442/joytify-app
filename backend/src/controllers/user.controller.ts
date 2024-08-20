import { RequestHandler } from "express";

import UserModel from "../models/user.model";
import appAssert from "../utils/app-assert.util";
import { verificationCodeSchema } from "../schemas/auth.schema";
import { NOT_FOUND, OK } from "../constants/http-code.constant";

export const getUserHandler: RequestHandler = async (req, res, next) => {
  try {
    // check user id
    const userId = verificationCodeSchema.parse(req.userId);

    // find user by id
    const user = await UserModel.findById(userId);

    appAssert(user, NOT_FOUND, "User not found");

    return res.status(OK).json(user.omitPassword());
  } catch (error) {
    next(error);
  }
};
