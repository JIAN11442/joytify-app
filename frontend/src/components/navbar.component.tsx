import { useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { IoIosMenu } from "react-icons/io";
import { CgShortcut } from "react-icons/cg";
import { IoNotificationsOutline } from "react-icons/io5";
import JoytifyLogo from "../../public/logos/joytify-logo.svg";

import Icon from "./react-icons.component";
import NavbarLink from "./navbar-link.component";
import UserEntryPoint from "./user-entry-point.component";
import NavbarSearchBar from "./navbar-searchbar.component";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { useGetUserUnviewedNotificationCountQuery } from "../hooks/notification-query.hook";
import { SearchFilterOptions } from "@joytify/types/constants";
import useKeyboardShortcutModalState from "../states/keyboard-shortcut-modal.state";
import useProviderState from "../states/provider.state";
import useSidebarState from "../states/sidebar.state";
import useNavbarState from "../states/navbar.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const Navbar = () => {
  const location = useLocation();
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { authUser } = useUserState();
  const { screenWidth } = useProviderState();
  const { activeFloatingSidebar, setActiveFloatingSidebar, setCollapseSideBarState } =
    useSidebarState();
  const { openKeyboardShortcutModal } = useKeyboardShortcutModalState();
  const {
    activeNavSearchBar,
    adjustNavSearchBarPosition,
    setActiveNavSearchBar,
    setAdjustNavSearchBarPosition,
  } = useNavbarState();

  const { unviewedCount } = useGetUserUnviewedNotificationCountQuery();
  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  const handleActiveFloatSidebar = () => {
    timeoutForDelay(() => {
      setActiveFloatingSidebar(!activeFloatingSidebar);
    });
  };

  const handleActiveNavbarSearchBar = () => {
    timeoutForDelay(() => {
      setActiveNavSearchBar(!activeNavSearchBar);
    });
  };

  const handleSearchBarOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const trimVal = val.trim();
    const newSearchParams = new URLSearchParams(searchParams);

    if (trimVal) {
      newSearchParams.set("q", trimVal);
    } else {
      newSearchParams.delete("q");
    }

    setSearchParams(newSearchParams);
  };

  const handleOpenKeyboardShortcutModal = () => {
    timeoutForDelay(() => {
      openKeyboardShortcutModal();
    });
  };

  const isSearchPage = location.pathname.includes("/search");

  const autoCloseSearchBarFn = {
    active: isSearchPage ? false : true,
    closeFn: () => {
      setActiveNavSearchBar(false);
    },
  };

  const { ALL } = SearchFilterOptions;

  // adjust navbar searchbar position
  useEffect(() => {
    if (screenWidth <= 550) {
      setAdjustNavSearchBarPosition(true);
    } else {
      setAdjustNavSearchBarPosition(false);
    }
  }, [screenWidth]);

  // if floating sidebar is active, collapse sidebar
  useEffect(() => {
    if (activeFloatingSidebar) {
      setCollapseSideBarState({ isCollapsed: false, isManualToggle: false });

      if (authUser) {
        updateUserPreferencesFn({ sidebarCollapsed: false });
      }
    }
  }, [activeFloatingSidebar]);

  return (
    <div className={`flex flex-col`}>
      <div
        className={`
          flex
          w-full
          py-1
          gap-x-3
          items-center
          justify-between
        `}
      >
        {/* Left side */}
        <div
          className={`
            flex
            w-full
            items-center
          `}
        >
          {/* logo */}
          <NavbarLink
            to="/"
            className={`
              flex
              w-[70px]
              items-center
              justify-center
              hover:opacity-80
              transition
            `}
          >
            <img src={JoytifyLogo} className={`w-6 h-6`} />
          </NavbarLink>

          {/* floating menu & home & search */}
          <div
            className={`
              flex
              w-full
              ml-2
              gap-x-3
              items-center
            `}
          >
            {/* floating menu */}
            <NavbarLink
              icon={{ name: IoIosMenu }}
              onClick={handleActiveFloatSidebar}
              className={`hidden max-sm:block`}
            />

            {/* home route */}
            <NavbarLink to="/" icon={{ name: HiHome }} />

            {/* search bar (screen-width more than 500px) */}
            <div
              className={`
                relative
                flex
                w-full
                items-center
              `}
            >
              <NavbarLink
                to={`/search/${type ?? ALL}`}
                icon={{ name: BiSearch }}
                onClick={handleActiveNavbarSearchBar}
              />

              <div
                className={`
                  absolute
                  top-0
                  w-full
                  min-w-[270px]
                  max-w-[400px]
                `}
              >
                <NavbarSearchBar
                  visible={activeNavSearchBar && !adjustNavSearchBarPosition}
                  autoCloseFn={autoCloseSearchBarFn}
                  onChange={handleSearchBarOnChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div
          className={`
            flex
            gap-x-3
            items-center
            justify-end
          `}
        >
          {/* notification */}
          {authUser && (
            <div className={`relative group`}>
              {unviewedCount !== undefined && unviewedCount > 0 && (
                <div
                  className={`
                    absolute
                    -top-1
                    -right-1
                    flex
                    ${unviewedCount >= 100 ? "w-8" : "w-5"}
                    h-5
                    bg-red-500
                    text-white
                    text-[10px]
                    rounded-full
                    items-center
                    justify-center
                    z-10
                    transition-all
                  `}
                >
                  <p>{unviewedCount >= 100 ? "99+" : unviewedCount}</p>
                </div>
              )}
              <NavbarLink to="/manage/notifications" icon={{ name: IoNotificationsOutline }} />
            </div>
          )}

          {/* shortcut */}
          {authUser && (
            <button
              type="button"
              onClick={handleOpenKeyboardShortcutModal}
              className={`navbar-link max-sm:hidden`}
            >
              <Icon name={CgShortcut} opts={{ size: 22 }} />
            </button>
          )}

          {/* user entry point */}
          <UserEntryPoint />
        </div>
      </div>

      {/* search bar (screen-width less then 500px) */}
      <NavbarSearchBar
        visible={activeNavSearchBar && adjustNavSearchBarPosition}
        autoCloseFn={autoCloseSearchBarFn}
        onChange={handleSearchBarOnChange}
        className={`rounded-lg`}
        tw={{ wrapper: `pt-1` }}
      />
    </div>
  );
};

export default Navbar;
