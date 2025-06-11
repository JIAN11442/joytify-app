import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSessions } from "../fetchs/session.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { DeviceStats } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

interface SessionQueryResult {
  userSessions: Awaited<ReturnType<typeof getUserSessions>>;
  deviceStats: DeviceStats;
}

export const useGetUserSessionsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data, ...rest } = useQuery<SessionQueryResult>({
    queryKey: [QueryKey.GET_USER_SESSIONS, userId],
    queryFn: async () => {
      try {
        const userSessions = await getUserSessions();

        const deviceStats = userSessions.reduce<DeviceStats>(
          (acc, session) => ({
            total: acc.total + 1,
            online: acc.online + (session.status.online ? 1 : 0),
            offline: acc.offline + (session.status.online ? 0 : 1),
          }),
          { total: 0, online: 0, offline: 0 }
        );

        return { userSessions, deviceStats };
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
        throw error;
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { ...data, ...rest };
};
