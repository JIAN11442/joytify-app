import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserNotificationsByType,
  getUserNotificationTypeCounts,
  getUserUnreadNotificationCount,
} from "../fetchs/notification.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { NotificationType } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";
import useNotificationState from "../states/notification.state";
import { playNotificationSound } from "../lib/notification-audio.lib";

const useNotificationCommon = () => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser || {};

  return { userId };
};

export const useGetUserNotificationsByTypeQuery = (type: NotificationType, opts: object = {}) => {
  const [page, setPage] = useState(1);
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: notifications, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_NOTIFICATIONS_BY_TYPE, userId, page, type],
    queryFn: async () => {
      try {
        const notifications = await getUserNotificationsByType({ type, page });

        return notifications;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    placeholderData: (prev) => prev,
    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { notifications, page, setPage, ...rest };
};

export const useGetUserUnreadNotificationCountQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: unreadCount, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_UNREAD_NOTIFICATION_COUNT, userId],
    queryFn: async () => {
      try {
        const { unread } = await getUserUnreadNotificationCount();

        const { shouldPlayNotificationSound, setShouldPlayNotificationSound } =
          useNotificationState.getState();

        // play notification sound if there is unread notification
        if (shouldPlayNotificationSound && unread !== undefined) {
          await playNotificationSound();
          setShouldPlayNotificationSound(false);
        }

        return unread;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },

    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { unreadCount, ...rest };
};

export const useGetUserNotificationTypeCountsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: counts, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_NOTIFICATION_TYPE_COUNTS, userId],
    queryFn: async () => {
      try {
        const counts = await getUserNotificationTypeCounts();

        return counts;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { counts, ...rest };
};
