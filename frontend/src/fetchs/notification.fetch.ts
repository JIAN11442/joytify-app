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

export const getUserNotificationsByType = (
  params: GetNotificationsByTypeRequest
): Promise<PaginatedNotificationResponse> => {
  const { type, page } = params;

  return API.get(`/notification/${type}`, { params: { page } });
};

export const getUserUnreadNotificationCount = (): Promise<{ unread: number }> =>
  API.get("/notification/unread");

export const getUserNotificationTypeCounts = (): Promise<NotificationCountsResponse> =>
  API.get("/notification/counts");

export const createNotification = (
  params: CreateNotificationRequest
): Promise<NotificationResponse> => API.post("/", params);
