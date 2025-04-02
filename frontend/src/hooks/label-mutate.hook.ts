import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { createLabel, removeLabel } from "../fetchs/label.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";

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
          return queryKey === QueryKey.GET_ALL_LABELS;
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
export const useRemoveLabelMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.REMOVE_LABEL_OPTION],
    mutationFn: removeLabel,
    onSuccess: (data) => {
      const { label } = data;

      // refetch labels query
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_ALL_LABELS;
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
