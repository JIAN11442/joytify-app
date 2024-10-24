import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { QueryKey } from "../constants/query-client-key.constant";
import { getSongById } from "../fetchs/song.fetch";
import useSoundState from "../states/sound.state";
import mergeLabels from "../lib/merge-labels.lib";

export const useSongById = (id: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setSongToPlay } = useSoundState();

  const { data: song, ...rest } = useQuery({
    queryKey: [QueryKey.GET_SONG_BY_ID],
    queryFn: async () => {
      try {
        const song = await getSongById(id);
        const generateSong = {
          ...song,
          artist: mergeLabels(song.artist, ", "),
          composers: mergeLabels(song.composers, ", "),
          languages: mergeLabels(song.languages, ", "),
        };

        return generateSong;
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

  useEffect(() => {
    if (song) {
      setSongToPlay(song);
    } else {
      setSongToPlay(null);
    }
  }, [song]);

  return { song, ...rest };
};
