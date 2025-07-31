import { useMutation } from "@tanstack/react-query";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import {
  deleteTargetNotification,
  markNotificationsAsRead,
  markNotificationsAsViewed,
} from "../fetchs/notification.fetch";
import queryClient from "../config/query-client.config";

export const useMarkNotificationsAsViewedMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.MARK_NOTIFICATIONS_AS_VIEWED],
    mutationFn: markNotificationsAsViewed,
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_UNVIEWED_NOTIFICATION_COUNT;
        },
      });
    },
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};

export const useMarkNotificationsAsReadMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.MARK_NOTIFICATIONS_AS_READ],
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_NOTIFICATIONS_BY_TYPE ||
            queryKey === QueryKey.GET_USER_UNVIEWED_NOTIFICATION_COUNT
          );
        },
      });
    },
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};

export const useDeleteTargetNotificationMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.DELETE_TARGET_NOTIFICATION],
    mutationFn: deleteTargetNotification,
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_UNVIEWED_NOTIFICATION_COUNT ||
            queryKey === QueryKey.GET_USER_NOTIFICATION_TYPE_COUNTS ||
            queryKey === QueryKey.GET_USER_NOTIFICATIONS_BY_TYPE
          );
        },
      });
    },
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};
