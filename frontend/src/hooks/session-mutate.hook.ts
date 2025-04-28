import { useMutation } from "@tanstack/react-query";
import { signOutAllActiveDevices } from "../fetchs/session.fetch";
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
