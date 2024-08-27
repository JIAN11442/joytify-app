import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import MutationKey from "../constants/mutation-key.constant";
import { getUserInfo } from "../fetchs/user.fetch";
import useUserState from "../states/user.state";

const useAuthHook = (opts: object = {}) => {
  const { queryState, setQueryState, isQueryError, setIsQueryError } =
    useUserState();

  const { data: user, ...rest } = useQuery({
    queryKey: [MutationKey.AUTH], // When this hook is called multiple times with the same key, it will return the same data
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
      setQueryState({ ...queryState, user });
    } else {
      setQueryState({ ...queryState, user: null });
    }
  }, [user]);

  return { user, ...rest };
};

export default useAuthHook;
