import { Router } from "express";
import {
  createNotificationHandler,
  getUserNotificationCountsHandler,
  getUserNotificationsByTypeHandler,
} from "../controllers/notification.controller";
import authenticate from "../middlewares/authenticate.middleware";

const notificationRoute = Router();

// prefix: /notification
notificationRoute.get("/counts", authenticate, getUserNotificationCountsHandler);
notificationRoute.get("/:type", authenticate, getUserNotificationsByTypeHandler);
notificationRoute.post("/", createNotificationHandler);

export default notificationRoute;
