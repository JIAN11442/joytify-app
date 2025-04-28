import { useMutation } from "@tanstack/react-query";

import { createLabel, removeLabel } from "../fetchs/label.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { QueryKeyType } from "../types/query-client-key.type";
import queryClient from "../config/query-client.config";
import toast from "../lib/toast.lib";

// create label mutation
export const useCreateLabelMutation = (closeModalFn: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.CREATE_LABEL_OPTION],
    mutationFn: createLabel,
    onSuccess: (data) => {
      const { label, type } = data;

      // refetch labels query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_UPLOAD_SONG_LABELS;
        },
      });

      // close modal
      closeModalFn();

      // display success message
      toast.success(`"${label}" ${type} is created`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// remove label mutation
export const useRemoveLabelMutation = (refetchQueryKey: QueryKeyType, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.REMOVE_LABEL_OPTION],
    mutationFn: removeLabel,
    onSuccess: (data) => {
      const { label } = data;

      // refetch labels query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === refetchQueryKey;
        },
      });

      // display remove success message
      toast.success(`"${label}" already removed`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
