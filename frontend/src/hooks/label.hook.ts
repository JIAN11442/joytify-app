import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { QueryKey } from "../constants/query-client-key.constant";
import { getUserLabels } from "../fetchs/label.fetch";
import useUserState from "../states/user.state";

export const useGetLabels = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { user } = useUserState();

  const {
    data: labels,
    refetch,
    ...rest
  } = useQuery({
    queryKey: [QueryKey.GET_ALL_LABELS],
    queryFn: async () => {
      try {
        const labels = await getUserLabels();

        return labels;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!user && !isQueryError,
    ...opts,
  });

  // while login or user change, refetch labels
  useEffect(() => {
    refetch();
  }, [user]);

  return { labels, refetch, ...rest };
};
