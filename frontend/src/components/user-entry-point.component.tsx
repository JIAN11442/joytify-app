import { BiUser } from "react-icons/bi";
import { IoIosPower } from "react-icons/io";
import { LuLayoutList } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";

import MenuItem from "./menu-item.component";
import AvatarMenu from "./avatar-menu.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { useLogoutMutation } from "../hooks/auth-mutate.hook";
import { AuthForOptions } from "@joytify/types/constants";
import { AuthUserResponse } from "@joytify/types/types";
import useAuthModalState from "../states/auth-modal.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const UserEntryPoint = () => {
  const { fm } = useScopedIntl();
  const userEntryFm = fm("user.entry");

  const { openAuthModal } = useAuthModalState();
  const { authUser, activeUserMenu, setActiveUserMenu } = useUserState();

  const { mutate: logoutFn } = useLogoutMutation();

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
            to={"/manage/songs"}
            icon={{ name: LuLayoutList }}
            label={userEntryFm("menu.manage")}
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
