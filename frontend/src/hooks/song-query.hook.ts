import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAllSongs, getSongById, getUserSongs, getUserSongsStats } from "../fetchs/song.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import useSongState from "../states/song.state";
import useUserState from "../states/user.state";

const useSongCommon = () => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser || {};

  return { userId };
};

// get all songs query
export const useGetAllSongsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setSongs } = useSongState();

  const { data: songs, ...rest } = useQuery({
    queryKey: [QueryKey.GET_ALL_SONGS],
    queryFn: async () => {
      try {
        const songs = await getAllSongs();

        setSongs(songs);

        return songs;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
          setSongs(null);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { songs, ...rest };
};

// get user's songs query
export const useGetUserSongsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useSongCommon();

  const { data: songs, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_SONGS, userId],
    queryFn: async () => {
      try {
        const userSongs = await getUserSongs();

        return userSongs;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { songs, ...rest };
};

// get song stats query
export const useGetUserSongStatsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { userId } = useSongCommon();

  const { data: songStats, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_SONGS_STATS, userId],
    queryFn: async () => {
      try {
        return await getUserSongsStats();
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { songStats, ...rest };
};

// get song by id
export const useGetSongByIdQuery = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: song, ...rest } = useQuery({
    queryKey: [QueryKey.GET_TARGET_SONG, id],
    queryFn: async () => {
      try {
        const song = await getSongById(id);

        return song;
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

  return { song, ...rest };
};
