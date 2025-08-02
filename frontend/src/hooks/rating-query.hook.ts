import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSongRating } from "../fetchs/rating.fetch";
import { QueryKey } from "../constants/query-client-key.constant";

export const useGetUserSongRating = (songId: string, opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: songRating, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_SONG_RATING, songId],
    queryFn: async () => {
      try {
        const rating = await getUserSongRating(songId);

        return rating;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    enabled: !!songId && !isQueryError,
    ...opts,
  });

  return { songRating, ...rest };
};
