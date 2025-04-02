import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { createAlbum, deleteAlbum, removeAlbum } from "../fetchs/album.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

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

// delete album mutation(*)
export const useDeleteAlbumMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.DELETE_ALBUM_OPTION],
    mutationFn: deleteAlbum,
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
      toast.success(`"${title}" already deleted`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
