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

type LibraryHeaderProps = {
  user: AxiosResponse | resUser | undefined;
};

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ user }) => {
  const [activeSearchBar, setActiveSearchBar] = useState(false);

  const { collapse, setCollapse } = useSidebarState();
  const { isCollapsed } = collapse;
  const { openAuthModal } = useAuthModalState();
  const { openUploadModal } = useUploadModalState();

  // handle collapse sidebar
  const handleCollapseSidebar = () => {
    // if sidebar isn't collapsed before click, it will collapse according screen resize after click
    // otherwise, if sidebar is collapsed before click, it can't collapse according screen resize after click
    // because collapse is a user behavior action, we don't want to change it automatically
    setCollapse({
      ...collapse,
      isCollapsed: !isCollapsed,
      changeForScreenResize: isCollapsed,
    });
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
          items-center
          justify-between
          pr-2
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
          `}
        />

        {/* Buttons */}
        <>
          {!isCollapsed && (
            <div
              className={`
                flex
                gap-1
              `}
            >
              {/* Search music */}
              <button
                onClick={handleActiveSearchBar}
                className={`
                  p-2
                  rounded-full
                  hover:bg-neutral-800
                  hover:scale-110
                  transition
                  group
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
                  p-2
                  rounded-full
                  hover:bg-neutral-800
                  hover:scale-110
                  transition
                  group
                `}
              >
                <Icon
                  name={AiOutlinePlus}
                  opts={{ size: 20 }}
                  className={`
                    text-neutral-400
                    group-hover:text-white  
                  `}
                />
              </button>
            </div>
          )}
        </>
      </div>

      {/* Search bar */}
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
    </div>
  );
};

export default LibraryHeader;
