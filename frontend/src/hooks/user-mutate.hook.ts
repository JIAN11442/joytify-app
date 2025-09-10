import { useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  changeUserPassword,
  deregisterUserAccount,
  resetUserPassword,
  updateUserInfo,
} from "../fetchs/user.fetch";
import { logout } from "../fetchs/auth.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { PasswordUpdateStatus } from "@joytify/types/constants";
import {
  DeregisterUserAccountRequest,
  UpdateUserInfoRequest,
  UserResponse,
} from "@joytify/types/types";
import useUserState from "../states/user.state";
import useSettingsState from "../states/settings.state";
import queryClient from "../config/query-client.config";
import { navigate } from "../lib/navigate.lib";
import toast from "../lib/toast.lib";

const { SUCCESS, FAILURE } = PasswordUpdateStatus;

type UpdateUserMutation = {
  delay?: number;
  refetchRelatedQueries?: boolean;
  closeModalFn?: () => void;
  onSuccessFn?: (data: UserResponse) => void;
  opts?: object;
};

// update user mutation
export const useUpdateUserMutation = ({
  delay,
  refetchRelatedQueries = true,
  closeModalFn,
  onSuccessFn,
  opts = {},
}: UpdateUserMutation = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.UPDATE_USER],
    mutationFn: async (data: UpdateUserInfoRequest) => {
      await new Promise((resolve) => setTimeout(resolve, delay ?? 0));

      return await updateUserInfo(data);
    },
    onSuccess: (data) => {
      // refetch related queries
      if (refetchRelatedQueries) {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return (
              queryKey === QueryKey.GET_AUTH_USER_INFO ||
              queryKey === QueryKey.GET_PROFILE_USER_INFO
            );
          },
        });
      }

      // call on success function
      onSuccessFn?.(data);

      // close modal
      if (closeModalFn) {
        closeModalFn();
      }

      // display success message
      toast.success("User info updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// reset user password mutation
export const useResetPasswordMutation = (opts: object = {}) => {
  const { setPasswordResetStatus } = useUserState();

  const mutation = useMutation({
    mutationKey: [MutationKey.RESET_USER_PASSWORD],
    mutationFn: resetUserPassword,
    onSuccess: () => {
      setPasswordResetStatus(SUCCESS);
    },
    onError: (error) => {
      if (error) {
        setPasswordResetStatus(FAILURE);
      }
    },
    ...opts,
  });

  return mutation;
};

// change user password mutation
export const useChangePasswordMutation = (opts: object = {}) => {
  const { setPasswordChangeStatus } = useSettingsState();

  const mutation = useMutation({
    mutationKey: [MutationKey.CHANGE_USER_PASSWORD],
    mutationFn: changeUserPassword,
    onSuccess: () => {
      setPasswordChangeStatus(SUCCESS);
    },
    onError: (error) => {
      if (error) {
        setPasswordChangeStatus(FAILURE);
        toast.error(error.message);
      }
    },
    ...opts,
  });

  return mutation;
};

// deregister user mutation
export const useDeregisterMutation = (closeModalFn: () => void, opts: object = {}) => {
  const location = useLocation();

  const mutation = useMutation({
    mutationKey: [MutationKey.DEREGISTER_USER],
    mutationFn: async (params: DeregisterUserAccountRequest) => {
      try {
        await deregisterUserAccount(params);
        await logout();

        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      // clear all queries data
      queryClient.setQueryData([QueryKey.GET_AUTH_USER_INFO], null);
      queryClient.setQueryData([QueryKey.GET_USER_PLAYLISTS], null);

      // close modal
      closeModalFn();

      // display success message
      toast.success("Your account has been deregistered successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
    ...opts,
  });

  return mutation;
};
