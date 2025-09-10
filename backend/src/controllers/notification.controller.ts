import { RequestHandler } from "express";
import { objectIdZodSchema, pageZodSchema } from "../schemas/util.zod";
import {
  markNotificationsZodSchema,
  triggerNotificationSocketZodSchema,
} from "../schemas/notification.zod";
import {
  getUserNotificationsByType,
  getUserNotificationTypeCounts,
  getUserUnviewedNotificationCount,
  markNotificationsAsRead,
  markNotificationsAsViewed,
  removeUserNotification,
  triggerNotificationSocket,
} from "../services/notification.service";
import { HttpCode } from "@joytify/types/constants";
import { NotificationFilterType } from "@joytify/types/types";

const { OK } = HttpCode;

export const getUserNotificationsByTypeHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const page = pageZodSchema.parse(req.query.page);
    const type = req.params.type as NotificationFilterType;

    const { docs } = await getUserNotificationsByType(userId, page, type);

    return res.status(OK).json(docs);
  } catch (error) {
    next(error);
  }
};

export const getUserUnviewedNotificationCountHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const count = await getUserUnviewedNotificationCount(userId);

    return res.status(OK).json({ unviewedCount: count });
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

// for aws lambda service
export const triggerNotificationSocketHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userIds } = triggerNotificationSocketZodSchema.parse(req.body);

    await triggerNotificationSocket(userIds);

    return res.status(OK).json({ message: "Notifiction socket triggered" });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsAsViewedHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { notificationIds } = markNotificationsZodSchema.parse(req.body);

    const { modifiedCount } = await markNotificationsAsViewed({ userId, notificationIds });

    return res.status(OK).json({ message: `${modifiedCount} notifications marked as viewed` });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsAsReadHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { notificationIds } = markNotificationsZodSchema.parse(req.body);

    const { modifiedCount } = await markNotificationsAsRead({ userId, notificationIds });

    return res.status(OK).json({ message: `${modifiedCount} notifications marked as read` });
  } catch (error) {
    next(error);
  }
};

export const removeUserNotificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const notificationId = objectIdZodSchema.parse(req.params.notificationId);

    await removeUserNotification({ userId, notificationId });

    return res.status(OK).json({ message: `Notification ${notificationId} removed` });
  } catch (error) {
    next(error);
  }
};
