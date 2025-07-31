import { Router } from "express";
import {
  getUserNotificationTypeCountsHandler,
  getUserNotificationsByTypeHandler,
  getUserUnviewedNotificationCountHandler,
  markNotificationsAsReadHandler,
  markNotificationsAsViewedHandler,
  removeUserNotificationHandler,
  triggerNotificationSocketHandler,
} from "../controllers/notification.controller";
import authenticate from "../middlewares/authenticate.middleware";
import { internalApiKeyValidate } from "../middlewares/api-key.middleware";

const notificationRoute = Router();

// prefix: /notifications
notificationRoute.get("/unviewed", authenticate, getUserUnviewedNotificationCountHandler);
notificationRoute.get("/counts", authenticate, getUserNotificationTypeCountsHandler);
notificationRoute.get("/:type", authenticate, getUserNotificationsByTypeHandler);
notificationRoute.post("/socket", internalApiKeyValidate, triggerNotificationSocketHandler);
notificationRoute.patch("/mark-viewed", authenticate, markNotificationsAsViewedHandler);
notificationRoute.patch("/mark-read", authenticate, markNotificationsAsReadHandler);
notificationRoute.delete("/:id", authenticate, removeUserNotificationHandler);

export default notificationRoute;
