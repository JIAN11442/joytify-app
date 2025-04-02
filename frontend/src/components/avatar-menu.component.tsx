import { useRef } from "react";

import Menu from "./menu.component";

import { timeoutForDelay } from "../lib/timeout.lib";
import { AuthUserResponse } from "@joytify/shared-types/types";

type AvatarMenuType = {
  authUser: AuthUserResponse;
  activeMenuState: {
    activeMenu: boolean;
    setActiveMenu: (state: boolean) => void;
  };
  children?: React.ReactNode;
};

const AvatarMenu: React.FC<AvatarMenuType> = ({ authUser, activeMenuState, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const { activeMenu, setActiveMenu } = activeMenuState;

  // handle user menu
  const handleActiveUserMenu = () => {
    timeoutForDelay(() => {
      setActiveMenu(!activeMenu);
    });
  };

  return (
    <div className={`flex relative`}>
      {/* User avatar */}
      <button
        onClick={handleActiveUserMenu}
        className="
          w-11
          h-11
          hover:opacity-80
          hover:scale-110
          shadow-[0px_0px_5px_1px]
        shadow-neutral-900/30
          rounded-full
          overflow-hidden
          transition
        "
      >
        <img
          src={authUser?.profile_img || ""}
          className="
            w-full
            h-full
            object-cover
          "
        />
      </button>

      {/* Menu panel */}
      <Menu
        ref={menuRef}
        activeState={{
          visible: activeMenu,
          setVisible: setActiveMenu,
        }}
        className={`top-0 right-12`}
      >
        {children}
      </Menu>
    </div>
  );
};

export default AvatarMenu;
