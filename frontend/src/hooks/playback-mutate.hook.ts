import { useMutation } from "@tanstack/react-query";
import { storePlaybackLog } from "../fetchs/playback.fetch";
import { MutationKey } from "../constants/query-client-key.constant";

// record playback log mutation
export const useRecordPlaybackLogMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.RECORD_PLAYBACK_LOG],
    mutationFn: storePlaybackLog,
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};
