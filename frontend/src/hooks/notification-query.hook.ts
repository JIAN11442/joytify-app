import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserNotificationCounts, getUserNotifications } from "../fetchs/notification.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { NotificationType } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

const useNotificationCommon = () => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser || {};

  return { userId };
};

export const useGetUserNotificationsQuery = (type: NotificationType, opts: object = {}) => {
  const [page, setPage] = useState(1);
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: notifications, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_NOTIFICATIONS_BY_TYPE, userId, page, type],
    queryFn: async () => {
      try {
        const notifications = await getUserNotifications({ type, page });

        return notifications;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    placeholderData: (prev) => prev,
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { notifications, page, setPage, ...rest };
};

export const useGetUserNotificationCountsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useNotificationCommon();

  const { data: counts, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_NOTIFICATION_COUNTS, userId],
    queryFn: async () => {
      try {
        const counts = await getUserNotificationCounts();

        return counts;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { counts, ...rest };
};
