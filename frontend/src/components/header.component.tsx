import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { IoIosMenu } from "react-icons/io";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import { logout } from "../fetchs/auth.fetch";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";
import useAuthModalState from "../states/auth-modal.state";
import MutationKey from "../constants/mutation-key.constant";
import AuthForOptions from "../constants/auth-type.constant";
import queryClient from "../config/query-client.config";

type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const { floating, setFloating } = useSidebarState();
  const { queryState, activeUserMenu, setActiveUserMenu } = useUserState();
  const { user } = queryState;
  const { openAuthModal } = useAuthModalState();

  const { mutate: logoutUser } = useMutation({
    mutationKey: [MutationKey.AUTH],
    mutationFn: logout,
    onSuccess: () => {
      // set user to null
      queryClient.setQueryData([MutationKey.AUTH], null);

      toast.success("Logged out successfully");
    },
  });

  // handle active float sidebar
  const handleActiveFloatSidebar = () => {
    const timeout = setTimeout(() => {
      setFloating(!floating);
    }, 0);

    return () => clearTimeout(timeout);
  };

  // handle active auth modal(login or register)
  const handleActiveAuthModal = (authFor: AuthForOptions) => {
    const timeout = setTimeout(() => {
      openAuthModal(authFor);
    }, 0);

    return () => clearTimeout(timeout);
  };

  // handle user menu
  const handleActiveUserMenu = () => {
    const timeout = setTimeout(() => {
      setActiveUserMenu(!activeUserMenu);
    }, 0);

    return () => clearTimeout(timeout);
  };

  // handle logout
  const handleLogoutUser = () => {
    const timeout = setTimeout(() => {
      logoutUser();
    }, 0);

    return () => clearTimeout(timeout);
  };

  // auto close user menu
  useEffect(() => {
    const handleOnBlue = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveUserMenu(false);
      } else {
        setActiveUserMenu(false);
      }
    };

    const timeout = setTimeout(() => {
      window.addEventListener("click", handleOnBlue);
    });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("click", handleOnBlue);
    };
  }, [menuRef]);

  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          h-fit
          p-6
          bg-gradient-to-b
          from-emerald-800
          to-neutral-900
          rounded-lg
      `,
        className
      )}
    >
      {/* Header */}
      <div
        className={`
          flex
          mb-4
          items-center
          justify-between
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
              <AnimationWrapper
                ref={menuRef}
                visible={activeUserMenu}
                initial={{
                  opacity: 0,
                  scale: "0%",
                  transformOrigin: "top right",
                }}
                animate={{
                  opacity: 1,
                  scale: "100%",
                  transformOrigin: "top right",
                }}
                transition={{ duration: 0.2 }}
                className={`
                  absolute
                  top-0
                  right-12
                  p-1
                  bg-neutral-900
                  border
                  border-neutral-700/50
                  flex
                  flex-col
                  w-[200px]
                  rounded-md
                  shadow-lg
                `}
              >
                <button className="menu-btn">profile</button>
                <button className="menu-btn">setting</button>
                <button onClick={handleLogoutUser} className="menu-btn">
                  logout
                </button>
              </AnimationWrapper>
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

export default Header;
