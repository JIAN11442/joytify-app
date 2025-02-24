import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import AvatarMenu from "./avatar-menu.component";

import { logout } from "../fetchs/auth.fetch";
import { deregisterUserAccount } from "../fetchs/user.fetch";

import useUserState from "../states/user.state";
import useAuthModalState from "../states/auth-modal.state";
import AuthForOptions from "../constants/auth.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";

const AuthOperation = () => {
  const { openAuthModal } = useAuthModalState();
  const { user, activeUserMenu, setActiveUserMenu } = useUserState();

  // logout mutation
  const { mutate: logoutUser } = useMutation({
    mutationKey: [MutationKey.LOGOUT],
    mutationFn: logout,
    onSuccess: () => {
      // clear user query data
      clearUserQueryData();

      // display success message
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // deregister mutation
  const { mutate: deregisterUser } = useMutation({
    mutationKey: [MutationKey.DEREGISTER_USER],
    mutationFn: deregisterUserAccount,
    onSuccess: () => {
      clearUserQueryData();
      toast.success("Deregister Successfully");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // Set the query data to null to refetch on the next request
  const clearUserQueryData = () => {
    queryClient.setQueryData([QueryKey.GET_USER_INFO], null);
    queryClient.setQueryData([QueryKey.GET_USER_PLAYLISTS], null);
  };

  // handle active auth modal(login or register)
  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    timeoutForDelay(() => {
      openAuthModal(authFor);
    });
  };

  // handle logout
  const handleLogoutUser = () => {
    timeoutForDelay(() => {
      logoutUser();
    });
  };

  // handle deregister user
  const handleDeregisterUser = () => {
    timeoutForDelay(() => {
      // logout first to clear the accessToken and firebase authentication record,
      // this prevents conflicts when signing up the same email again
      logout();

      // deregister account
      deregisterUser();
    });
  };

  return (
    <>
      {user ? (
        // Avatar & Menu
        <AvatarMenu
          user={user}
          activeMenuState={{
            activeMenu: activeUserMenu,
            setActiveMenu: setActiveUserMenu,
          }}
        >
          <button className={`menu-btn`}>profile</button>
          <button className={`menu-btn`}>setting</button>
          <button onClick={handleLogoutUser} className={`menu-btn`}>
            logout
          </button>
          <button className={`menu-btn`} onClick={handleDeregisterUser}>
            deregister
          </button>
        </AvatarMenu>
      ) : (
        // Sign up and login button
        <div
          className={`
            flex
            gap-5
            items-center
          `}
        >
          {/* Sign up button */}
          <button
            type="button"
            onClick={() => handleActiveAuthModal(AuthForOptions.SIGN_UP)}
            className={`
              text-sm
              text-nowrap
              text-neutral-400
              hover:text-white
              hover:scale-105
              transition
            `}
          >
            Sign up
          </button>

          {/* login button */}
          <button
            type="button"
            onClick={() => handleActiveAuthModal(AuthForOptions.SIGN_IN)}
            className={`auth-btn`}
          >
            Log in
          </button>
        </div>
      )}
    </>
  );
};

export default AuthOperation;
