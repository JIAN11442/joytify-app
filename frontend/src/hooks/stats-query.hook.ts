import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyStats } from "../fetchs/stats.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { GetMonthlyStatsRequest } from "@joytify/types/types";

export const useGetMonthlyStats = (params: GetMonthlyStatsRequest, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: monthlyStats, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_MONTHLY_STATS],
    queryFn: async () => {
      try {
        const stats = await getMonthlyStats(params);

        return stats;
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

  return { monthlyStats, ...rest };
};
