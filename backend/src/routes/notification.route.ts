import { Router } from "express";
import {
  createNotificationHandler,
  deleteNotificationHandler,
  getUserNotificationTypeCountsHandler,
  getUserNotificationsByTypeHandler,
  getUserUnreadNotificationCountHandler,
  triggerNotificationSocketHandler,
} from "../controllers/notification.controller";
import authenticate from "../middlewares/authenticate.middleware";
import apiKeyValidate from "../middlewares/api-key.middleware";

const notificationRoute = Router();

// prefix: /notification
notificationRoute.get("/unread", authenticate, getUserUnreadNotificationCountHandler);
notificationRoute.get("/counts", authenticate, getUserNotificationTypeCountsHandler);
notificationRoute.get("/:type", authenticate, getUserNotificationsByTypeHandler);

notificationRoute.post("/broadcast/socket", triggerNotificationSocketHandler);
notificationRoute.post("/", createNotificationHandler);

notificationRoute.delete("/:id", deleteNotificationHandler);

export default notificationRoute;
