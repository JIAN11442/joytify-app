import { useState } from "react";
import { LuLibrary } from "react-icons/lu";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { AxiosResponse } from "axios";

import Icon from "./react-icons.component";
import SidebarItem from "./sidebar-item.component";
import InputBox from "./input-box.component";
import AnimationWrapper from "./animation-wrapper.component";

import useSidebarState from "../states/sidebar.state";
import useAuthModalState from "../states/auth-modal.state";
import AuthForOptions from "../constants/auth-type.constant";
import { resUser } from "../constants/data-type.constant";
import useUploadModalState from "../states/upload-modal.state";
import useProviderState from "../states/provider.state";

type LibraryHeaderProps = {
  user: AxiosResponse | resUser | undefined;
};

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ user }) => {
  const [activeSearchBar, setActiveSearchBar] = useState(false);

  const { screenWidth } = useProviderState();
  const {
    collapseSideBarState,
    floating,
    disabledCollapseFn,
    setCollapseSideBarState,
    setFloating,
  } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { openAuthModal } = useAuthModalState();
  const { openUploadModal } = useUploadModalState();

  // handle collapse sidebar
  const handleCollapseSidebar = () => {
    if (!floating) {
      // if screen width is between 640 and 768, collapse sidebar continuously
      if (screenWidth >= 640 && screenWidth <= 768) {
        setCollapseSideBarState({
          ...collapseSideBarState,
          isCollapsed: true,
          changeForScreenResize: isCollapsed,
        });
      }
      // if screen width is not between 640 and 768, toggle collapse sidebar
      else {
        setCollapseSideBarState({
          ...collapseSideBarState,
          isCollapsed: !isCollapsed,
          changeForScreenResize: isCollapsed,
        });
      }
    } else {
      setFloating(false);
    }
  };

  // handle active library search bar
  const handleActiveSearchBar = () => {
    setActiveSearchBar(!activeSearchBar);
  };

  // handle active upload music modal
  const handleActiveUploadMusicModal = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const timeout = setTimeout(() => {
      if (floating) {
        setFloating(false);
      }

      return user ? openUploadModal() : openAuthModal(AuthForOptions.SIGN_IN);
    }, 0);

    return () => clearTimeout(timeout);
  };

  return (
    <div
      className={`
        flex
        flex-col
        px-3
        w-full
      `}
    >
      {/* Header */}
      <div
        className={`
          flex
          ${!isCollapsed ? "relative" : !floating && "flex-col"}
          ${!disabledCollapseFn && "gap-y-4"}
          items-center
          justify-between
          pt-5
        `}
      >
        {/* Title */}
        <SidebarItem
          icon={LuLibrary}
          label="Your Library"
          onClick={handleCollapseSidebar}
          collapse={isCollapsed}
          className={`
            w-fit
            ${disabledCollapseFn && "hidden"}
          `}
        />

        {/* Buttons */}
        <div
          className={`
            flex 
            gap-1
            ${!isCollapsed && "absolute right-0"}
          `}
        >
          {/* Search music */}
          <button
            onClick={handleActiveSearchBar}
            disabled={!user}
            className={`
              p-2
              ${
                user
                  ? `
                  group
                  rounded-full
                  hover:bg-neutral-800
                  hover:scale-110
                  transition
                `
                  : "opacity-50"
              }
              ${!isCollapsed || floating ? "flex" : "hidden"} 
            `}
          >
            <Icon
              name={BiSearch}
              opts={{ size: 20 }}
              className={`
                text-neutral-400
                group-hover:text-white
              `}
            />
          </button>

          {/* Adding music */}
          <button
            onClick={(e) => handleActiveUploadMusicModal(e)}
            className={`
              group
              ${
                (!isCollapsed || floating) &&
                `
                  p-2
                  rounded-full
                  hover:bg-neutral-800
                  hover:scale-110
                  transition
                `
              }
            `}
          >
            <Icon
              name={AiOutlinePlus}
              opts={{ size: !isCollapsed || floating ? 20 : 28 }}
              className={`
                ${
                  isCollapsed && !floating
                    ? "text-neutral-700"
                    : "text-neutral-400"
                }
                group-hover:text-white  
              `}
            />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <>
        {(!isCollapsed || floating) && (
          <AnimationWrapper
            key="searchbar"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ width: "20%", opacity: 0 }}
            visible={activeSearchBar}
            mode="sync"
            className={`
              flex-1
              py-3
            `}
          >
            <InputBox
              id="seachbar"
              type="text"
              name="searchBar"
              placeholder="Search your library"
              icon={BiSearch}
              autoFocus
              className={`
                py-3
                border-none
                rounded-md
              `}
            />
          </AnimationWrapper>
        )}
      </>
    </div>
  );
};

export default LibraryHeader;
