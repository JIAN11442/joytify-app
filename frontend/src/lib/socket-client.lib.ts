import { Socket } from "socket.io-client";
import queryClient from "../config/query-client.config";
import { QueryKey } from "../constants/query-client-key.constant";
import useNotificationState from "../states/notification.state";

// handle notification update socket event
const onNotificationUpdate = async () => {
  const { setShouldPlayNotificationSound } = useNotificationState.getState();

  // flag to play notification sound
  setShouldPlayNotificationSound(true);

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
};

export const setupSocketClientEvents = (socket: Socket) => {
  if (!socket) return;

  socket.on("notification:update", onNotificationUpdate);

  return () => {
    socket.off("notification:update", onNotificationUpdate);
  };
};
