import { useMutation } from "@tanstack/react-query";
import { signOutAllActiveDevices, touchSessionHeartBeat } from "../fetchs/session.fetch";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import { logout } from "../fetchs/auth.fetch";
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

// touch session heartbeat
export const useTouchSessionHeartBeatMutation = (opts: object = {}) => {
  const mutation = useMutation({
    mutationKey: [MutationKey.TOUCH_SESSION_HEARTBEAT],
    mutationFn: touchSessionHeartBeat,
    onSuccess: (data) => {
      console.log("更新 session 心跳", data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...opts,
  });

  return mutation;
};
