import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import AvatarMenu from "./avatar-menu.component";

import { logout } from "../fetchs/auth.fetch";
import useUserState from "../states/user.state";
import useAuthModalState from "../states/auth-modal.state";
import AuthForOptions from "../constants/auth-type.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { timeoutForDelay } from "../lib/timeout.lib";
import queryClient from "../config/query-client.config";

const AuthOperation = () => {
  const { openAuthModal } = useAuthModalState();
  const { user, activeUserMenu, setActiveUserMenu } = useUserState();

  // handle logout
  const handleLogoutUser = () => {
    timeoutForDelay(() => {
      logoutUser();
    });
  };

  // handle active auth modal(login or register)
  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    timeoutForDelay(() => {
      openAuthModal(authFor);
    });
  };

  // logout mutation
  const { mutate: logoutUser } = useMutation({
    mutationKey: [MutationKey.LOGOUT],
    mutationFn: logout,
    onSuccess: () => {
      // set user to null
      queryClient.setQueryData([QueryKey.GET_USER_INFO], null);
      queryClient.setQueryData([QueryKey.GET_USER_PLAYLISTS], null);

      toast.success("Logged out successfully");
    },
  });

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
          <button className="menu-btn">profile</button>
          <button className="menu-btn">setting</button>
          <button onClick={handleLogoutUser} className="menu-btn">
            logout
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
              text-nowrap
              text-[15px]
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
