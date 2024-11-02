import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import useUserState from "../states/user.state";
import usePlaylistState from "../states/playlist.state";
import { getPlaylists, getPlaylistById } from "../fetchs/playlist.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import mergeLabels from "../lib/merge-labels.lib";

export const usePlaylists = (
  searchParams: string | null,
  opts: object = {}
) => {
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
        const data = await getPlaylists(
          searchParams?.length ? searchParams : null
        );

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
  }, [user, searchParams]);

  return { playlists, refetch, ...rest };
};

export const usePlaylistById = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setTargetPlaylist } = usePlaylistState();

  const { data: playlist, ...rest } = useQuery({
    queryKey: [QueryKey.GET_TARGET_PLAYLIST],
    queryFn: async () => {
      try {
        const data = await getPlaylistById(id);

        const generateData = {
          ...data,
          songs: data.songs.map((song) => {
            return {
              ...song,
              artist: mergeLabels(song.artist, ", "),
              lyricists: mergeLabels(song.lyricists, ", "),
              composers: mergeLabels(song.composers, ", "),
              languages: mergeLabels(song.languages, ", "),
            };
          }),
        };

        return generateData;
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

  return { playlist, isQueryError, ...rest };
};
