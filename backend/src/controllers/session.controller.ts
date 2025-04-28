import { RequestHandler } from "express";
import SessionModel from "../models/session.model";
import { HttpCode } from "@joytify/shared-types/constants";
import { objectIdZodSchema } from "../schemas/util.zod";
import appAssert from "../utils/app-assert.util";

const { OK, INTERNAL_SERVER_ERROR } = HttpCode;

// delete user sessions handler
export const deleteUserSessionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);

    const deletedSessions = await SessionModel.deleteMany({ user: userId });

    appAssert(
      deletedSessions.acknowledged === true,
      INTERNAL_SERVER_ERROR,
      "Failed to delete sessions"
    );

    return res.status(OK).json({ message: "Delete sessions successfully" });
  } catch (error) {
    next(error);
  }
};
