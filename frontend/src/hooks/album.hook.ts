import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryKey } from "../constants/query-client-key.constant";
import { getUserAlbums } from "../fetchs/album.fetch";

// get albums hook
export const useGetAlbums = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);

  const { data: albums, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_ALBUMS],
    queryFn: async () => {
      try {
        const albums = await getUserAlbums();

        return albums;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity,
    enabled: !isQueryError,
    ...opts,
  });

  return { albums, ...rest };
};
