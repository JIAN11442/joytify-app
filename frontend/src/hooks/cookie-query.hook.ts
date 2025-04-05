import { useSuspenseQuery } from "@tanstack/react-query";

import { getUserPreferencesCookie } from "../fetchs/cookie.fetch";
import { QueryKey } from "../constants/query-client-key.constant";
import { SuspenseQueryOptions } from "../types/tanstack-query.type";
import { UserPreferencesCookieParams } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

// get verified user preferences cookie
export const useGetUserPreferencesCookieQuery = (
  opts: SuspenseQueryOptions<UserPreferencesCookieParams | null> = {}
) => {
  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { data: userPreferences, ...rest } = useSuspenseQuery({
    queryKey: [QueryKey.GET_USER_PREFERENCES, userId],
    queryFn: getUserPreferencesCookie,
    ...opts,
  });

  return { userPreferences, ...rest };
};
