import { RequestHandler } from "express";
import { objectIdZodSchema, pageZodSchema } from "../schemas/util.zod";
import { createNotificationZodSchema } from "../schemas/notification.zod";
import {
  createNotification,
  getUserNotificationCounts,
  getUserNotificationsByType,
} from "../services/notification.service";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateNotificationRequest, NotificationType } from "@joytify/shared-types/types";

const { OK } = HttpCode;

export const getUserNotificationCountsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { counts } = await getUserNotificationCounts(userId);

    return res.status(OK).json(counts);
  } catch (error) {
    next(error);
  }
};

export const getUserNotificationsByTypeHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const page = pageZodSchema.parse(req.query.page);
    const type = req.params.type as NotificationType;

    const { docs } = await getUserNotificationsByType(userId, page, type);

    return res.status(OK).json(docs || {});
  } catch (error) {
    next(error);
  }
};

export const createNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const params: CreateNotificationRequest = createNotificationZodSchema.parse(req.body);
    const notification = await createNotification(params);

    return res.status(OK).json({ notification });
  } catch (error) {
    next(error);
  }
};
