import { RequestHandler } from "express";
import { objectIdZodSchema, pageZodSchema } from "../schemas/util.zod";
import {
  createNotificationZodSchema,
  triggerNotificationSocketZodSchema,
} from "../schemas/notification.zod";
import {
  createNotification,
  getUserNotificationsByType,
  getUserNotificationTypeCounts,
  getUserUnreadNotificationCount,
  triggerNotificationSocket,
} from "../services/notification.service";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateNotificationRequest, NotificationType } from "@joytify/shared-types/types";
import UserModel from "../models/user.model";
import appAssert from "../utils/app-assert.util";
import NotificationModel from "../models/notification.model";

const { OK, NOT_FOUND } = HttpCode;

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

export const getUserUnreadNotificationCountHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const count = await getUserUnreadNotificationCount(userId);

    return res.status(OK).json({ unread: count });
  } catch (error) {
    next(error);
  }
};

export const getUserNotificationTypeCountsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { counts } = await getUserNotificationTypeCounts(userId);

    return res.status(OK).json(counts);
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

export const triggerNotificationSocketHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userIds } = triggerNotificationSocketZodSchema.parse(req.body);

    await triggerNotificationSocket(userIds);

    return res.status(OK).json({ message: "Notifiction socket triggered" });
  } catch (error) {
    next(error);
  }
};

export const deleteNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const notificationId = objectIdZodSchema.parse(req.params.id);

    const updatedUser = await UserModel.updateMany(
      { "notifications.unread": notificationId },
      { $pull: { "notifications.unread": notificationId } }
    );

    await NotificationModel.findByIdAndDelete(notificationId);

    return res
      .status(OK)
      .json({ message: `${updatedUser.modifiedCount} users updated and notification deleted` });
  } catch (error) {
    next(error);
  }
};
