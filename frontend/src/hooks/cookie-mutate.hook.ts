import { useMutation } from "@tanstack/react-query";
import { updateUserPreferencesCookie } from "../fetchs/cookie.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

// update user preferences mutation
export const useUpdateUserPreferencesMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_USER_PREFERENCES],
    mutationFn: updateUserPreferencesCookie,
    onSuccess: () => {
      // refetch user preferences query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_PREFERENCES;
        },
      });
    },
    ...opts,
  });

  return mutation;
};
