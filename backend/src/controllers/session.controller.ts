import mongoose from "mongoose";
import { RequestHandler } from "express";
import SessionModel from "../models/session.model";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import appAssert from "../utils/app-assert.util";

const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get user sessions handler
export const getUserSessionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(objectIdZodSchema.parse(req.userId));
    const sessionObjId = new mongoose.Types.ObjectId(objectIdZodSchema.parse(req.sessionId));

    const sessions = await SessionModel.aggregate([
      { $match: { user: userObjId } },
      { $addFields: { isCurrent: { $eq: ["$_id", sessionObjId] } } },
      { $sort: { isCurrent: -1, "status.lastActive": -1 } },
    ]);

    return res.status(OK).json(sessions);
  } catch (error) {
    next(error);
  }
};

// update session handler
export const touchSessionHeartBeatHandler: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date();
    const sessionId = objectIdZodSchema.parse(req.sessionId);

    const updatedSession = await SessionModel.findByIdAndUpdate(sessionId, {
      $set: { "status.lastActive": now, "status.online": true },
      new: true,
    });

    return res.status(OK).json(updatedSession);
  } catch (error) {
    next(error);
  }
};

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

// delete session by id handler
export const deleteSessionByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = objectIdZodSchema.parse(req.params.sessionId);

    const deletedSession = await SessionModel.deleteOne({ _id: sessionId });

    appAssert(deletedSession.deletedCount > 0, NOT_FOUND, "Session not found");

    return res.status(OK).json({ message: "Delete session successfully" });
  } catch (error) {
    next(error);
  }
};
