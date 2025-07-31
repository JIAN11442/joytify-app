import { useMutation } from "@tanstack/react-query";

import {
  createSongData,
  deleteTargetSong,
  rateSong,
  updateSongInfo,
  updateSongPlaylistsAssignment,
} from "../fetchs/song.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { UpdateSongInfoRequest } from "@joytify/shared-types/types";
import queryClient from "../config/query-client.config";
import { navigate } from "../lib/navigate.lib";
import toast from "../lib/toast.lib";

type UpdateSongInfoParams = Omit<UpdateSongInfoRequest, "songId">;

// create song mutation
export const useCreateSongMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.CREATE_NEW_SONG],
    mutationFn: createSongData,
    onSuccess: (data) => {
      const { title, playlistFor } = data;

      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_ALL_SONGS ||
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_TARGET_PLAYLIST ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO ||
            queryKey === QueryKey.GET_USER_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS_STATS
          );
        },
      });

      // close modal
      closeModalFn();

      // navigate to playlist
      navigate(`/playlist/${playlistFor}`);

      // display success message
      toast.success(`“${title}” has been created successfully`);
    },
    onError: (error) => toast.error(error.message),
    ...opts,
  });

  return mutation;
};

// update song info mutation
export const useUpdateSongInfoMutation = (
  songId: string,
  closeModalFn?: () => void,
  opts: object = {}
) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_TARGET_SONG_INFO],
    mutationFn: (params: UpdateSongInfoParams) => updateSongInfo({ songId, ...params }),
    onSuccess: (data) => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_ALL_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS_STATS ||
            queryKey === QueryKey.GET_TARGET_SONG ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO ||
            queryKey === QueryKey.GET_PROFILE_COLLECTION_INFO
          );
        },
      });

      closeModalFn?.();

      toast.success(`“${data.title}” has been updated successfully`);
    },
    onError: (error) => {
      console.log(error.message);
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// rate song mutation
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

// assign song to playlists mutation
export const useAssignSongToPlaylistsMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.ASSIGN_SONG_TO_PLAYLISTS],
    mutationFn: updateSongPlaylistsAssignment,
    onSuccess: (data) => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_PLAYLISTS || queryKey === QueryKey.GET_USER_SONGS;
        },
      });

      closeModalFn();

      toast.success(`“${data.title}” has been assigned to playlists successfully`);
    },
    onError: (error) => {
      console.log(error.message);
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// delete song mutation
export const useDeleteSongMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.DELETE_TARGET_SONG],
    mutationFn: deleteTargetSong,
    onSuccess: (data) => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_ALL_SONGS ||
            queryKey === QueryKey.GET_USER_PLAYLISTS ||
            queryKey === QueryKey.GET_USER_SONGS ||
            queryKey === QueryKey.GET_USER_SONGS_STATS ||
            queryKey === QueryKey.GET_PROFILE_USER_INFO
          );
        },
      });

      closeModalFn();

      // display success message
      toast.success(`“${data.title}” has been deleted successfully`);
    },
    onError: (error) => {
      console.log(error.message);
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
