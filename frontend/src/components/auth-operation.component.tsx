import { BiUser } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosPower, IoMdLogOut } from "react-icons/io";

import AvatarMenu from "./avatar-menu.component";
import MenuItem from "./menu-item.component";

import { useDeregisterMutation, useLogoutMutation } from "../hooks/auth-mutate.hook";
import { AuthForOptions } from "@joytify/shared-types/constants";
import { AuthUserResponse } from "@joytify/shared-types/types";
import useAuthModalState from "../states/auth-modal.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const AuthOperation = () => {
  const { openAuthModal } = useAuthModalState();
  const { authUser, activeUserMenu, setActiveUserMenu } = useUserState();

  // mutations
  const { mutate: logoutFn } = useLogoutMutation();
  const { mutate: deregisterFn } = useDeregisterMutation();

  // handle active auth modal(login or register)
  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    timeoutForDelay(() => {
      openAuthModal(authFor);
    });
  };

  // handle logout
  const handleLogoutUser = () => {
    timeoutForDelay(() => {
      logoutFn();
    });
  };

  // handle deregister user
  const handleDeregisterUser = () => {
    timeoutForDelay(() => {
      deregisterFn();
    });
  };

  return (
    <>
      {authUser ? (
        // Avatar & Menu
        <AvatarMenu
          authUser={authUser as AuthUserResponse}
          activeMenuState={{
            activeMenu: activeUserMenu,
            setActiveMenu: setActiveUserMenu,
          }}
        >
          <MenuItem to={`/profile/${authUser._id}`} icon={{ name: BiUser }} label="profile" />
          <MenuItem to={"/settings"} icon={{ name: IoSettingsOutline }} label="setting" />
          <MenuItem onClick={handleLogoutUser} icon={{ name: IoIosPower }} label="logout" />
          <MenuItem onClick={handleDeregisterUser} icon={{ name: IoMdLogOut }} label="deregister" />
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
