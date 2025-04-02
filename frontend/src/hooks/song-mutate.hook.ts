import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { createSongData } from "../fetchs/song.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import { navigate } from "../lib/navigate.lib";

// create song mutation
export const useCreateSongMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.CREATE_NEW_SONG],
    mutationFn: createSongData,
    onSuccess: (data) => {
      const { title, playlist_for } = data;

      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_ALL_SONGS ||
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_TARGET_PLAYLIST
          );
        },
      });

      // close modal
      closeModalFn();

      // navigate to playlist
      navigate(`/playlist/${playlist_for}`);

      // display success message
      toast.success(`“${title}” has been created successfully`);
    },
    onError: (error) => toast.error(error.message),
    ...opts,
  });

  return mutation;
};
