import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { createNotification } from "../fetchs/notification.fetch";
import { MutationKey } from "../constants/query-client-key.constant";

export const useCreateNotificationMutation = (opts: object) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.CREATE_NOTIFICATION],
    mutationFn: createNotification,
    onSuccess: () => {
      toast.success("Notification created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
