import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "../constants/query-client-key.constant";
import { getUserAlbums } from "../fetchs/album.fetch";
import useUserState from "../states/user.state";

// get albums hook
export const useGetAlbums = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { user } = useUserState();

  const {
    data: albums,
    refetch,
    ...rest
  } = useQuery({
    queryKey: [QueryKey.GET_USER_ALBUMS, user],
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

  return { albums, refetch, ...rest };
};
