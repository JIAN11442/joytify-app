import { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import { IoIosMenu } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import JoytifyLogo from "../../public/joytify-logo.svg";

import AuthOperation from "./auth-operation.component";
import NavbarSearchBar from "./navbar-searchbar.component";

import useNavbarState from "../states/navbar.state";
import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";
import NavbarLink from "./navbar-link.component";

const Navbar = () => {
  const [searchBarVal, setSearchBarVal] = useState("");

  const { floating, setFloating } = useSidebarState();
  const {
    activeNavSearchBar,
    adjustNavSearchBarPosition,
    setActiveNavSearchBar,
    setAdjustNavSearchBarPosition,
  } = useNavbarState();

  const { screenWidth } = useProviderState();

  // handle active float sidebar
  const handleActiveFloatSidebar = () => {
    timeoutForDelay(() => {
      setFloating(!floating);
    });
  };

  // handle active navbar search bar
  const handleActiveNavbarSearchBar = () => {
    timeoutForDelay(() => {
      setActiveNavSearchBar(!activeNavSearchBar);
      navigate("/search");
    });
  };

  // handle searchbar onChange
  const handleSearchBarOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setSearchBarVal(val);
  };

  // auto close searchbar function
  const autoCloseSearchBarFn = {
    active: true,
    closeFn: () => {
      setActiveNavSearchBar(false);
    },
  };

  useEffect(() => {
    if (screenWidth <= 550) {
      setAdjustNavSearchBarPosition(true);
    } else {
      setAdjustNavSearchBarPosition(false);
    }
  }, [screenWidth]);

  return (
    <div
      className={`
        flex-1
        bg-black
      `}
    >
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
                  value={searchBarVal}
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
            items-center
            justify-end
          `}
        >
          <AuthOperation />
        </div>
      </div>

      {/* search bar (screen-width less then 500px) */}
      <NavbarSearchBar
        visible={activeNavSearchBar && adjustNavSearchBarPosition}
        value={searchBarVal}
        autoCloseFn={autoCloseSearchBarFn}
        onChange={handleSearchBarOnChange}
        className={`rounded-lg`}
        tw={{ wrapper: `pt-1` }}
      />
    </div>
  );
};

export default Navbar;
