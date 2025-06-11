import { useMutation } from "@tanstack/react-query";

import { logout } from "../fetchs/auth.fetch";
import {
  signOutAllActiveDevices,
  signOutTargetDevice,
  touchSessionHeartBeat,
} from "../fetchs/session.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import toast from "../lib/toast.lib";

// sign out devices mutation
export const useSignOutDevicesMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.SIGN_OUT_DEVICES],
    mutationFn: signOutAllActiveDevices,
    onSuccess: () => {
      logout();

      queryClient.setQueryData([QueryKey.GET_AUTH_USER_INFO], null);
      queryClient.setQueryData([QueryKey.GET_USER_PLAYLISTS], null);

      toast.success("Signed out from all devices successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// sign out target device
export const useSignOutTargetDeviceMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.SIGN_OUT_TARGET_DEVICE],
    mutationFn: signOutTargetDevice,
    onSuccess: () => {
      // refetch user sessions
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === QueryKey.GET_USER_SESSIONS;
        },
      });

      toast.success("Sign out device successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};

// touch session heartbeat
export const useTouchSessionHeartBeatMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.TOUCH_SESSION_HEARTBEAT],
    mutationFn: touchSessionHeartBeat,
    ...opts,
  });

  return mutation;
};
