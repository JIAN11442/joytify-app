import {
  NotificationType,
  CreateNotificationRequest,
  NotificationResponse,
  NotificationCountsResponse,
  PaginatedNotificationResponse,
} from "@joytify/shared-types/types";
import API from "../config/api-client.config";

type GetNotificationsByTypeRequest = {
  type: NotificationType;
  page: number;
};

export const getUserNotifications = (
  params: GetNotificationsByTypeRequest
): Promise<PaginatedNotificationResponse> => {
  const { type, page } = params;

  return API.get(`/notification/${type}`, { params: { page } });
};

export const getUserNotificationCounts = (): Promise<NotificationCountsResponse> =>
  API.get("/notification/counts");

export const createNotification = (
  params: CreateNotificationRequest
): Promise<NotificationResponse> => API.post("/", params);
