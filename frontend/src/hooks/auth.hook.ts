import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import MutationKey from "../constants/mutation-key.constant";
import { getUserInfo } from "../fetchs/user.fetch";
import useUserState from "../states/user.state";

const useAuthHook = (opts: object = {}) => {
  const { setUser } = useUserState();

  const { data: user, ...rest } = useQuery({
    queryKey: [MutationKey.AUTH],
    queryFn: getUserInfo,
    staleTime: Infinity,
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

export default useAuthHook;
