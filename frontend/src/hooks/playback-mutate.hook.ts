import { useMutation } from "@tanstack/react-query";
import { storePlaybackLog } from "../fetchs/playback.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

// record playback log mutation
export const useRecordPlaybackLogMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.RECORD_PLAYBACK_LOG],
    mutationFn: storePlaybackLog,
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_SONGS_STATS;
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
