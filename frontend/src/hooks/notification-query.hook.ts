import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserNotificationsByType,
  getUserNotificationTypeCounts,
  getUserUnviewedNotificationCount,
} from "../fetchs/notification.fetch";
import { useMarkNotificationsAsViewedMutation } from "./notification-mutate.hook";
import { NotificationFilterOptions } from "@joytify/types/constants";
import { QueryKey } from "../constants/query-client-key.constant";
import { NotificationFilterType } from "@joytify/types/types";
import useNotificationState from "../states/notification.state";
import useUserState from "../states/user.state";
import { playNotificationSound } from "../lib/notification-audio.lib";

const useNotificationCommon = () => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser || {};

  return { userId };
};

export const useGetUserNotificationsByTypeQuery = (
  type: NotificationFilterType,
  opts: object = {}
) => {
  const { ALL } = NotificationFilterOptions;

  const [page, setPage] = useState(1);
  const [isQueryError, setIsQueryError] = useState(false);

  const { userId } = useNotificationCommon();
  const { mutate: markNotificationsAsViewed } = useMarkNotificationsAsViewedMutation();

  const { data: notifications, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_NOTIFICATIONS_BY_TYPE, userId, page, type],
    queryFn: async () => {
      try {
        const notifications = await getUserNotificationsByType({ type, page });
        const unviewedNotificationIds = notifications.docs
          .filter((doc) => doc.viewed === false && doc.type !== ALL && doc.type === type)
          .map((doc) => doc._id);

        // mark unviewed notifications as viewed
        if (unviewedNotificationIds.length > 0) {
          markNotificationsAsViewed(unviewedNotificationIds);
        }

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

export const useGetUserUnviewedNotificationCountQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: unviewedCount, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_UNVIEWED_NOTIFICATION_COUNT, userId],
    queryFn: async () => {
      try {
        const { unviewedCount } = await getUserUnviewedNotificationCount();
        const { shouldPlayNotificationSound, setShouldPlayNotificationSound } =
          useNotificationState.getState();

        // play notification sound if there is unviewed notification
        if (shouldPlayNotificationSound && unviewedCount !== undefined) {
          await playNotificationSound();

          setShouldPlayNotificationSound(false);
        }

        return unviewedCount;
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

  return { unviewedCount, ...rest };
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
