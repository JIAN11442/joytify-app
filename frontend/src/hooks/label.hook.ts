import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryKey } from "../constants/query-client-key.constant";
import { getUserLabels } from "../fetchs/label.fetch";

export const useGetLabel = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: labels, ...rest } = useQuery({
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
    enabled: !isQueryError,
    ...opts,
  });

  return { labels, ...rest };
};
