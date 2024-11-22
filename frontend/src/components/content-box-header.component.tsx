import { useRef } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { IoIosMenu } from "react-icons/io";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import Icon from "./react-icons.component";
import Menu from "./menu.component";

import { logout } from "../fetchs/auth.fetch";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";
import useAuthModalState from "../states/auth-modal.state";
import AuthForOptions from "../constants/auth-type.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import { timeoutForDelay } from "../lib/timeout.lib";

type ContentBoxHeaderProps = {
  children: React.ReactNode;
  options?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const ContentBoxHeader: React.FC<ContentBoxHeaderProps> = ({
  children,
  options = true,
  style,
  className,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const { floating, setFloating } = useSidebarState();
  const { user, activeUserMenu, setActiveUserMenu } = useUserState();
  const { openAuthModal } = useAuthModalState();

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

  // handle active float sidebar
  const handleActiveFloatSidebar = () => {
    timeoutForDelay(() => {
      setFloating(!floating);
    });
  };

  // handle active auth modal(login or register)
  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    timeoutForDelay(() => {
      openAuthModal(authFor);
    });
  };

  // handle user menu
  const handleActiveUserMenu = () => {
    timeoutForDelay(() => {
      setActiveUserMenu(!activeUserMenu);
    });
  };

  // handle logout
  const handleLogoutUser = () => {
    timeoutForDelay(() => {
      logoutUser();
    });
  };

  return (
    <div
      style={style}
      className={twMerge(
        `
          flex
          flex-col
          h-fit
          bg-gradient-to-b
          from-emerald-800
          to-neutral-900  
          rounded-lg
      `,
        className
      )}
    >
      {/* header */}
      <div
        className={`
          mb-4
          items-center
          justify-between
          ${options ? "flex" : "hidden"}
        `}
      >
        {/* Left side */}
        <>
          {/*  Navigate page (appears when screen size is greater than 'sm') */}
          <div
            className={`
              gap-3
              hidden
              sm:flex
            `}
          >
            {/* Navigate back */}
            <button
              onClick={() => navigate(-1)}
              className={`
                p-3
                bg-black/50
                rounded-full
                hover:opacity-80
                hover:scale-110
                transition
              `}
            >
              <Icon name={FaAngleLeft} opts={{ size: 20 }} />
            </button>

            {/* Navigate forword */}
            <button
              onClick={() => navigate(1)}
              className={`
                p-3
                bg-black/50
                rounded-full
                hover:opacity-80
                hover:scale-110
                transition
              `}
            >
              <Icon name={FaAngleRight} opts={{ size: 20 }} />
            </button>
          </div>

          {/* Menu (appears when screen size is lower than 'sm') */}
          <button
            onClick={handleActiveFloatSidebar}
            className={`
              p-3
              rounded-full
              bg-black/50
              hover:scale-110
              transition
              hidden
              max-sm:block
            `}
          >
            <Icon name={IoIosMenu} opts={{ size: 20 }} />
          </button>
        </>

        {/* Right side */}
        <>
          {user ? (
            // Avatar & Menu
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
                  src={user.profile_img}
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
                  visible: activeUserMenu,
                  setVisible: setActiveUserMenu,
                }}
                className={`
                   top-0
                   right-12
                `}
              >
                <button className="menu-btn">profile</button>
                <button className="menu-btn">setting</button>
                <button onClick={handleLogoutUser} className="menu-btn">
                  logout
                </button>
              </Menu>
            </div>
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
                onClick={() => handleActiveAuthModal(AuthForOptions.SIGN_UP)}
                className={`
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
                onClick={() => handleActiveAuthModal(AuthForOptions.SIGN_IN)}
                className={`auth-btn`}
              >
                Log in
              </button>
            </div>
          )}
        </>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
};

export default ContentBoxHeader;
