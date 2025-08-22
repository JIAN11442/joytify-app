import { useMutation } from "@tanstack/react-query";
import { createPlaybackLog } from "../fetchs/playback.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { PlaybackLogResponse } from "@joytify/shared-types/types";
import useSongState from "../states/song.state";
import queryClient from "../config/query-client.config";
import { timeoutForDelay } from "../lib/timeout.lib";

// record playback log mutation
export const useRecordPlaybackLogMutation = (opts: object = {}) => {
  const { setActiveSongRateModal } = useSongState();

  const mutation = useMutation({
    mutationKey: [MutationKey.RECORD_PLAYBACK_LOG],
    mutationFn: createPlaybackLog,
    onSuccess: (data: PlaybackLogResponse | null) => {
      if (!data) return;

      const { shouldPrompt, song } = data;

      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_ALL_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS_STATS ||
            queryKey === QueryKey.GET_USER_SONGS
          );
        },
      });

      // show rate modal if need to prompt
      if (shouldPrompt) {
        timeoutForDelay(() => {
          setActiveSongRateModal({ active: true, song });
        });
      }
    },
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};
