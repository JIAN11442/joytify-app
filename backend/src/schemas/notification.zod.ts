import z from "zod";
import { objectIdZodSchema, stringZodSchema } from "./util.zod";

export const createSystemAnnouncementZodSchema = z.object({
  date: stringZodSchema,
  startTime: stringZodSchema,
  endTime: stringZodSchema,
});

export const triggerNotificationSocketZodSchema = z.object({
  userIds: z.array(objectIdZodSchema),
});

export const broadcastNotificationZodSchema = z.object({
  userIds: z.array(objectIdZodSchema),
  notificationId: stringZodSchema,
  triggerSocket: z.boolean(),
});

export const markNotificationsZodSchema = z.object({
  notificationIds: z.array(stringZodSchema),
});
