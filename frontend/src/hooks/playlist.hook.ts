import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { QueryKey } from "../constants/query-client-key.constant";
import { getAllPlaylists, getPlaylistById } from "../fetchs/playlist.fetch";
import usePlaylistState from "../states/playlist.state";
import useUserState from "../states/user.state";

export const usePlaylists = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setUserPlaylists } = usePlaylistState();
  const { user } = useUserState();

  const {
    data: playlists,
    refetch,
    ...rest
  } = useQuery({
    queryKey: [QueryKey.GET_USER_PLAYLISTS],
    queryFn: async () => {
      try {
        const data = await getAllPlaylists();

        return data;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!user && !isQueryError,
    ...opts,
  });

  // save playlists to zustand
  useEffect(() => {
    if (playlists) {
      setUserPlaylists(playlists);
    } else {
      setUserPlaylists(null);
    }
  }, [playlists]);

  // if user change, refetch playlists
  useEffect(() => {
    refetch();
  }, [user]);

  return { playlists, refetch, ...rest };
};

export const usePlaylistById = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setTargetPlaylist } = usePlaylistState();

  const {
    data: playlist,
    refetch,
    ...rest
  } = useQuery({
    queryKey: [QueryKey.GET_TARGET_PLAYLIST],
    queryFn: async () => {
      try {
        const data = await getPlaylistById(id);

        return data;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!id && !isQueryError,
    ...opts,
  });

  // save target playlist to zustand
  useEffect(() => {
    if (playlist) {
      setTargetPlaylist(playlist);
    } else {
      setTargetPlaylist(null);
    }
  }, [playlist]);

  // if id change, refetch playlist
  useEffect(() => {
    refetch();
  }, [id]);

  return { playlist, refetch, ...rest };
};
