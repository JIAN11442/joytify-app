import { useMutation } from "@tanstack/react-query";
import { createAlbum, removeAlbum, updateAlbumInfo } from "../fetchs/album.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import toast from "../lib/toast.lib";

// create album mutation
export const useCreateAlbumMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.CREATE_ALBUM_OPTION],
    mutationFn: createAlbum,
    onSuccess: (data) => {
      const { title } = data;

      // refetch get albums query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_ALBUMS;
        },
      });

      // close modal
      closeModalFn();

      // display success message
      toast.success(`"${title}" album is created`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// update album mutation
export const useUpdateAlbumMutation = (closeModalFn?: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_ALBUM_OPTION],
    mutationFn: updateAlbumInfo,
    onSuccess: (data) => {
      const { title } = data;

      // refetch get albums query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_ALBUMS || queryKey === QueryKey.GET_TARGET_ALBUM;
        },
      });

      // close modal
      closeModalFn?.();

      // display success message
      toast.success(`"${title}" album is updated`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// remove album mutation
export const useRemoveAlbumMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.REMOVE_ALBUM_OPTION],
    mutationFn: removeAlbum,
    onSuccess: (data) => {
      const { title } = data;

      // refetch get albums query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_ALBUMS;
        },
      });

      // display success message
      toast.success(`"${title}" already removed`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
