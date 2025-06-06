import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAllSongs, getSongById } from "../fetchs/song.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import useSongState from "../states/song.state";

// get all songs query
export const useGetSongsQuery = (opts: object = {}) => {
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

// get song by id
export const useGetSongByIdQuery = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: song, ...rest } = useQuery({
    queryKey: [QueryKey.GET_SONG_BY_ID, id],
    queryFn: async () => {
      try {
        const song = await getSongById(id);

        console.log(song);

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
