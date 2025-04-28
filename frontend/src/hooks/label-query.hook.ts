import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLabels } from "../fetchs/label.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { LabelOptionsType } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

export const useGetLabelsQuery = (
  queryKey: (typeof QueryKey)[keyof typeof QueryKey],
  types?: LabelOptionsType[],
  sortByIndex?: boolean,
  opts: object = {}
) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: labels, ...rest } = useQuery({
    queryKey: [queryKey, userId],
    queryFn: async () => {
      try {
        const labels = await getLabels(types, sortByIndex);

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
