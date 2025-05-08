import { BiUser } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosPower, IoMdLogOut } from "react-icons/io";

import AvatarMenu from "./avatar-menu.component";
import MenuItem from "./menu-item.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useLogoutMutation } from "../hooks/auth-mutate.hook";
import { useGetProfileUserInfoQuery } from "../hooks/user-query.hook";
import { AuthForOptions } from "@joytify/shared-types/constants";
import { AuthUserResponse, RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useAuthModalState from "../states/auth-modal.state";
import useSettingsState from "../states/settings.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const UserEntryPoint = () => {
  const { fm } = useScopedIntl();
  const userEntryFm = fm("user.entry");

  const { openAuthModal } = useAuthModalState();
  const { authUser, activeUserMenu, setActiveUserMenu } = useUserState();
  const { openAccountDerergistrationModal } = useSettingsState();

  const { mutate: logoutFn } = useLogoutMutation();
  const { profileUser } = useGetProfileUserInfoQuery();

  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    timeoutForDelay(() => {
      openAuthModal(authFor);
    });
  };

  const handleLogoutUser = () => {
    timeoutForDelay(() => {
      logoutFn();
    });
  };

  const handleDeregisterUser = () => {
    timeoutForDelay(() => {
      openAccountDerergistrationModal(profileUser as RefactorProfileUserResponse);
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
          <MenuItem
            to={`/profile/${authUser._id}`}
            icon={{ name: BiUser }}
            label={userEntryFm("menu.profile")}
          />
          <MenuItem
            to={"/settings/account"}
            icon={{ name: IoSettingsOutline }}
            label={userEntryFm("menu.setting")}
          />
          <MenuItem
            onClick={handleLogoutUser}
            icon={{ name: IoIosPower }}
            label={userEntryFm("menu.logout")}
          />
          <MenuItem
            onClick={handleDeregisterUser}
            icon={{ name: IoMdLogOut }}
            label={userEntryFm("menu.deregister")}
          />
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
            {userEntryFm("button.signUp")}
          </button>

          {/* login button */}
          <button
            type="button"
            onClick={() => handleActiveAuthModal(AuthForOptions.SIGN_IN)}
            className={`auth-btn`}
          >
            {userEntryFm("button.signIn")}
          </button>
        </div>
      )}
    </>
  );
};

export default UserEntryPoint;
