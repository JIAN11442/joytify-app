import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserLabels } from "../fetchs/label.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import useUserState from "../states/user.state";

export const useGetLabelsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: labels, ...rest } = useQuery({
    queryKey: [QueryKey.GET_ALL_LABELS, userId],
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
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { labels, ...rest };
};
