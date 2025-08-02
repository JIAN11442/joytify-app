import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { rateSong } from "../fetchs/rating.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

export const useRateSongMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.RATE_SONG],
    mutationFn: rateSong,
    onSuccess: (data) => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS_STATS ||
            queryKey === QueryKey.GET_USER_SONG_RATING ||
            queryKey === QueryKey.GET_TARGET_SONG ||
            queryKey === QueryKey.GET_USER_PLAYLISTS
          );
        },
      });

      closeModalFn();

      toast.success(`${data.title} has been rated successfully`);
    },
    onError: (error) => {
      console.log(error.message);
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
