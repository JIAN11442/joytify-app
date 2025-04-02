import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getPlaylists, getPlaylistById } from "../fetchs/playlist.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import usePlaylistState from "../states/playlist.state";
import useUserState from "../states/user.state";

// get all user playlists
export const useGetPlaylistsQuery = (searchParams?: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { authUser } = useUserState();
  const { setUserPlaylists } = usePlaylistState();
  const { _id: userId } = authUser ?? {};

  const { data: playlists, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_PLAYLISTS, userId, searchParams],
    queryFn: async () => {
      try {
        const data = await getPlaylists(searchParams);

        setUserPlaylists(data);

        return data;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
          setUserPlaylists(null);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { playlists, ...rest };
};

// get playlist by id
export const useGetPlaylistByIdQuery = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setTargetPlaylist } = usePlaylistState();

  const { data: playlist, ...rest } = useQuery({
    queryKey: [QueryKey.GET_TARGET_PLAYLIST, id],
    queryFn: async () => {
      try {
        const playlist = await getPlaylistById(id);

        setTargetPlaylist(playlist);

        return playlist;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
          setTargetPlaylist(null);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!id && !isQueryError,
    ...opts,
  });

  return { playlist, ...rest };
};
