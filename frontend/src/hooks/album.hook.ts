import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

  // while login or user change, refetch albums
  useEffect(() => {
    refetch();
  }, [user]);

  return { albums, refetch, ...rest };
};
