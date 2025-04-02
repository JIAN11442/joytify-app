import { useEffect, useRef } from "react";
import { LuLibrary } from "react-icons/lu";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { MdLibraryMusic, MdMusicNote } from "react-icons/md";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import SidebarItem from "./sidebar-item.component";
import InputSearchBar from "./input-searchbar.component";

import { useGetPlaylistsQuery } from "../hooks/playlist-query.hook";
import { useCreatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { AuthForOptions } from "@joytify/shared-types/constants";
import { AuthUserResponse } from "@joytify/shared-types/types";
import useUploadModalState from "../states/upload-modal.state";
import useAuthModalState from "../states/auth-modal.state";
import useSidebarState from "../states/sidebar.state";
import useLibraryState from "../states/library.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type LibraryHeaderProps = {
  authUser?: AuthUserResponse | null;
};

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ authUser }) => {
  const addingMenuRef = useRef<HTMLDivElement>(null);

  const { collapseSideBarState, floating, setCollapseSideBarState, setFloating } =
    useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { openAuthModal } = useAuthModalState();
  const { openUploadModal } = useUploadModalState();
  const {
    activeAddingOptions,
    activeLibrarySearchBar,
    librarySearchVal,
    setActiveAddingOptions,
    setActiveLibrarySearchBar,
    setLibrarySearchVal,
  } = useLibraryState();

  const { playlists } = useGetPlaylistsQuery(librarySearchVal);
  const { mutate: createPlaylistFn } = useCreatePlaylistMutation();

  // handle collapse sidebar
  const handleCollapseSidebar = () => {
    if (!floating) {
      setCollapseSideBarState({
        ...collapseSideBarState,
        isCollapsed: !isCollapsed,
        changeForScreenResize: isCollapsed,
      });
    } else {
      setFloating(false);
    }
  };

  // handle active library search bar
  const handleActiveSearchBar = () => {
    timeoutForDelay(() => {
      setActiveLibrarySearchBar(!activeLibrarySearchBar);
    });
  };

  // handle close library search bar
  const handleCloseSearchBar = () => {
    timeoutForDelay(() => {
      setActiveLibrarySearchBar(false);
      setLibrarySearchVal(null);
    });
  };

  // handle active adding options
  const handleActiveAddingOptions = () => {
    timeoutForDelay(() => {
      setActiveAddingOptions(!activeAddingOptions);
    });
  };

  // handle active upload music modal
  const handleActiveUploadMusicModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    timeoutForDelay(() => {
      if (floating) {
        setFloating(false);
      }

      return authUser ? openUploadModal() : openAuthModal(AuthForOptions.SIGN_IN);
    });
  };

  // handle create new playlist
  const handleCreateNewPlaylist = () => {
    timeoutForDelay(() => {
      createPlaylistFn();
    });
  };

  // handle library playlist search on change
  const handleOnChangeLibrarySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    timeoutForDelay(() => {
      setLibrarySearchVal(value);
    });
  };

  // while sidebar is collapsed, clean search value and close the searchbar
  useEffect(() => {
    if (isCollapsed) {
      if (!playlists?.length) {
        handleCloseSearchBar();
      }
    }
  }, [isCollapsed]);

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
          pt-4
          gap-y-4
          items-center
          justify-between
        `}
      >
        {/* Title */}
        <SidebarItem
          icon={{ name: LuLibrary }}
          label="Your Library"
          onClick={handleCollapseSidebar}
          collapse={isCollapsed}
          className={`w-fit`}
        />

        {/* Buttons */}
        <div
          className={`
            flex 
            gap-1
            ${!isCollapsed && "absolute right-0"}
          `}
        >
          {/* Search button */}
          <button
            onClick={handleActiveSearchBar}
            disabled={!authUser}
            className={`
              p-2
              ${
                authUser
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

          {/* Adding button */}
          <div className={`relative`}>
            <button
              onClick={handleActiveAddingOptions}
              className={`
                group
                outline-none
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
                opts={{ size: !isCollapsed || floating ? 20 : 24 }}
                className={`
                  ${isCollapsed && !floating ? "text-neutral-700" : "text-neutral-400"}
                  group-hover:text-white  
                `}
              />
            </button>

            {/* Adding options menu */}
            <Menu
              ref={addingMenuRef}
              activeState={{
                visible: activeAddingOptions,
                setVisible: setActiveAddingOptions,
              }}
              wrapper={{ transformOrigin: "top left" }}
              className={`
                fixed
                w-[210px]
              `}
            >
              {/* Add new song button */}
              <button
                onClick={handleActiveUploadMusicModal}
                className={`
                  menu-btn
                  flex
                  gap-3
                  items-center
                  normal-case
                `}
              >
                <Icon name={MdMusicNote} opts={{ size: 16 }} />
                <p>Create a new song</p>
              </button>

              {/* Add new playlist button */}
              <button
                onClick={handleCreateNewPlaylist}
                className={`
                  menu-btn
                  flex
                  gap-3
                  items-center
                  normal-case
                `}
              >
                <Icon name={MdLibraryMusic} opts={{ size: 16 }} />
                <p>Create a new playlist</p>
              </button>
            </Menu>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <InputSearchBar
        id="library-searchbar"
        placeholder="Search your playlist"
        visible={activeLibrarySearchBar && (!isCollapsed || floating)}
        icon={{ name: BiSearch }}
        autoCloseFn={{
          active: true,
          closeFn: handleCloseSearchBar,
        }}
        onChange={(e) => handleOnChangeLibrarySearch(e)}
        tw={{ wrapper: `pt-3` }}
      />
    </div>
  );
};

export default LibraryHeader;
