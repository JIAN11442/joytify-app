import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { QueryKey } from "../constants/query-client-key.constant";
import { getUserInfo } from "../fetchs/user.fetch";
import useUserState from "../states/user.state";

const useAuth = (opts: object = {}) => {
  const [isQueryError, setIsQueryError] = useState(false);
  const { setUser } = useUserState();

  const { data: user, ...rest } = useQuery({
    queryKey: [QueryKey.GET_USER_INFO], // When this hook is called multiple times with the same key, it will return the same data
    queryFn: async () => {
      try {
        const data = await getUserInfo();

        return data;
      } catch (error) {
        if (error) {
          setIsQueryError(true);
        }
      }
    },
    staleTime: Infinity, // the query result is never stale unless manually refetched (like refetch() or queryClient.invalidateQueries())
    enabled: !isQueryError, // if get the query error, then stop the query (for loading)
    ...opts,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  }, [user]);

  return { user, ...rest };
};

export default useAuth;
