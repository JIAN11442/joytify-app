import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  NotificationType,
  NotificationCountsResponse,
  PaginatedNotificationResponse,
} from "@joytify/shared-types/types";
import API from "../config/api-client.config";

type GetNotificationsByTypeRequest = {
  type: NotificationType;
  page: number;
};

const { NOTIFICATIONS } = API_ENDPOINTS;

export const getUserNotificationsByType = (
  params: GetNotificationsByTypeRequest
): Promise<PaginatedNotificationResponse> => {
  const { type, page } = params;

  return API.get(`${NOTIFICATIONS}/${type}`, { params: { page } });
};

export const getUserUnviewedNotificationCount = (): Promise<{ unviewedCount: number }> =>
  API.get(`${NOTIFICATIONS}/unviewed`);

export const getUserNotificationTypeCounts = (): Promise<NotificationCountsResponse> =>
  API.get(`${NOTIFICATIONS}/counts`);

export const markNotificationsAsViewed = (notificationIds: string[]) =>
  API.patch(`${NOTIFICATIONS}/mark-viewed`, { notificationIds });

export const markNotificationsAsRead = (notificationIds: string[]) =>
  API.patch(`${NOTIFICATIONS}/mark-read`, { notificationIds });

export const deleteTargetNotification = (notificationId: string) =>
  API.delete(`${NOTIFICATIONS}/${notificationId}`);
