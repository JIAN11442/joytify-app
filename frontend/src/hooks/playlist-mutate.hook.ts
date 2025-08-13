import { useMutation } from "@tanstack/react-query";

import { createPlaylist, deletePlaylist, updatePlaylist } from "../fetchs/playlist.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "@joytify/shared-types/types";
import queryClient from "../config/query-client.config";
import { navigate } from "../lib/navigate.lib";
import toast from "../lib/toast.lib";

type UpdatePlaylistParams = Omit<UpdatePlaylistRequest, "playlistId">;

// create playlist mutation
export const useCreatePlaylistMutation = (closeModalFn?: () => void, opts: object = {}) => {
  const { mutate, ...rest } = useMutation({
    mutationKey: [MutationKey.CREATE_USER_PLAYLIST],
    mutationFn: createPlaylist,
    onSuccess: (data) => {
      const { _id: id, title } = data;

      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO ||
            queryKey === QueryKey.GET_PROFILE_COLLECTION_INFO ||
            queryKey === QueryKey.GET_USER_PLAYLISTS
          );
        },
      });

      // close create playlist modal
      if (closeModalFn) {
        closeModalFn();
      }

      // navigate to created playlist page
      navigate(`/playlist/${id}`);

      // display success message
      toast.success(`"${title}" playlist is created`);
    },
    onError: () => {
      toast.error("Failed to create playlist");
    },
    ...opts,
  });

  // refactor mutate to allow calling with or without parameters
  const refactoredMutate = (params?: CreatePlaylistRequest) => {
    if (params) {
      mutate(params);
    } else {
      mutate({});
    }
  };

  return { mutate: refactoredMutate, ...rest };
};

// update playlist mutation
export const useUpdatePlaylistMutation = (
  playlistId: string,
  closeModalFn?: () => void,
  opts: object = {}
) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_PLAYLIST],
    mutationFn: (params: UpdatePlaylistParams) => updatePlaylist({ playlistId, ...params }),
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_TARGET_PLAYLIST ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO ||
            queryKey === QueryKey.GET_PROFILE_COLLECTION_INFO ||
            queryKey === QueryKey.GET_USER_PLAYLISTS
          );
        },
      });

      // close modal
      if (closeModalFn) {
        closeModalFn();
      }

      // display success message
      toast.success("Playlist updated successfully");
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
    ...opts,
  });

  return mutation;
};

// delete playlist mutation
export const useDeletePlaylistMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.DELETE_PLAYLIST],
    mutationFn: deletePlaylist,
    onSuccess: (data) => {
      const { title } = data;

      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO ||
            queryKey === QueryKey.GET_PROFILE_COLLECTION_INFO
          );
        },
      });

      // close modal
      closeModalFn();

      // navigate to homepage
      navigate("/");

      // display success message
      toast.success(`Playlist "${title}" has been deleted.`);
    },
    onError: (error) => {
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};
