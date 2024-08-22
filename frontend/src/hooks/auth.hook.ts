import { useQuery } from "@tanstack/react-query";

import MutationKey from "../constants/mutation-key.constant";
import { getUserInfo } from "../fetchs/user.fetch";

const useAuthHook = (opts: object = {}) => {
  const { data: user, ...rest } = useQuery({
    queryKey: [MutationKey.AUTH],
    queryFn: getUserInfo,
    staleTime: Infinity,
    ...opts,
  });

  return { user, ...rest };
};

export default useAuthHook;
