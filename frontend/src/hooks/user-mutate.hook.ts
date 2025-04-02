import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { resetUserPassword, updateUserInfo } from "../fetchs/user.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { PasswordResetStatus } from "@joytify/shared-types/constants";
import useUserState from "../states/user.state";
import queryClient from "../config/query-client.config";

// reset user password mutation
export const useResetPasswordMutation = (opts: object = {}) => {
  const { setPasswordResetStatus } = useUserState();
  const { SUCCESS, FAILED } = PasswordResetStatus;

  const mutation = useMutation({
    mutationKey: [MutationKey.RESET_USER_PASSWORD],
    mutationFn: resetUserPassword,
    onSuccess: () => {
      setPasswordResetStatus(SUCCESS);
    },
    onError: (error) => {
      if (error) {
        setPasswordResetStatus(FAILED);
      }
    },
    ...opts,
  });

  return mutation;
};

// update user mutation
export const useUpdateUserMutation = (closeModalFn?: () => void, opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_USER],
    mutationFn: updateUserInfo,
    onSuccess: () => {
      // refetch related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return (
            queryKey === QueryKey.GET_AUTH_USER_INFO || queryKey === QueryKey.GET_PROFILE_USER_INFO
          );
        },
      });

      // close modal
      if (closeModalFn) {
        closeModalFn();
      }

      // display success message
      toast.success("User info updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user info");
    },
    ...opts,
  });

  return mutation;
};
