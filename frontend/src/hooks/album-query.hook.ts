import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserAlbums } from "../fetchs/album.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import useUserState from "../states/user.state";

// get albums hook
export const useGetAlbumsQuery = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: albums, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_ALBUMS, userId],
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
    enabled: !!userId && !isQueryError,
    ...opts,
  });

  return { albums, ...rest };
};
