import { useCallback, useEffect, useMemo, useRef } from "react";
import { LuLibrary } from "react-icons/lu";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { MdLibraryMusic, MdMusicNote } from "react-icons/md";

import Menu from "./menu.component";
import MenuItem from "./menu-item.component";
import Icon from "./react-icons.component";
import SidebarItem from "./sidebar-item.component";
import SearchBarInput from "./searchbar-input.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useGetPlaylistsQuery } from "../hooks/playlist-query.hook";
import { useCreatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
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
  const { fm } = useScopedIntl();
  const libraryFm = fm("library");

  const addingMenuRef = useRef<HTMLDivElement>(null);

  const {
    collapseSideBarState,
    activeFloatingSidebar,
    setCollapseSideBarState,
    setActiveFloatingSidebar,
  } = useSidebarState();
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
  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  const { SIGN_IN } = AuthForOptions;

  const handleCollapseSidebar = useCallback(() => {
    timeoutForDelay(() => {
      if (!activeFloatingSidebar) {
        setCollapseSideBarState({
          isCollapsed: !isCollapsed,
          isManualToggle: true,
        });

        updateUserPreferencesFn({ sidebarCollapsed: !isCollapsed });
      } else {
        setActiveFloatingSidebar(false);
      }
    });
  }, [isCollapsed, activeFloatingSidebar]);

  const handleActiveSearchBar = useCallback(() => {
    timeoutForDelay(() => {
      if (!authUser) {
        openAuthModal(SIGN_IN);
        return;
      }
      setActiveLibrarySearchBar(!activeLibrarySearchBar);
    });
  }, [authUser, activeLibrarySearchBar, openAuthModal]);

  const handleActiveAddingOptions = useCallback(() => {
    timeoutForDelay(() => {
      if (!authUser) {
        openAuthModal(SIGN_IN);
        return;
      }

      setActiveAddingOptions(!activeAddingOptions);
    });
  }, [authUser, activeAddingOptions]);

  const handleActiveUploadMusicModal = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      timeoutForDelay(() => {
        if (activeFloatingSidebar) {
          setActiveFloatingSidebar(false);
        }

        return authUser ? openUploadModal() : openAuthModal(SIGN_IN);
      });
    },
    [activeFloatingSidebar, authUser]
  );

  const handleCloseSearchBar = () => {
    timeoutForDelay(() => {
      setActiveLibrarySearchBar(false);
      setLibrarySearchVal(null);
    });
  };

  const handleCreateNewPlaylist = () => {
    timeoutForDelay(() => {
      createPlaylistFn();
    });
  };

  const handleOnChangeLibrarySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    timeoutForDelay(() => {
      setLibrarySearchVal(value);
    });
  };

  const isSidebarExpandedOrFloating = useMemo(() => {
    return !isCollapsed || activeFloatingSidebar;
  }, [isCollapsed, activeFloatingSidebar]);

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
      {/* header */}
      <div
        className={`
          flex
          w-full
          pt-4
          gap-4
          items-center
          justify-between
          ${!isSidebarExpandedOrFloating && "flex-col"}
        `}
      >
        {/* title */}
        <SidebarItem
          icon={{ name: LuLibrary }}
          label={libraryFm("title")}
          onClick={handleCollapseSidebar}
          collapse={isCollapsed}
          className={`w-full`}
          tw={{ label: "text-lgc" }}
        />

        {/* buttons */}
        <div
          className={`
            flex 
            gap-1
          `}
        >
          {/* search */}
          <button
            onClick={handleActiveSearchBar}
            className={`
              p-2
              group
              rounded-full
              hover:bg-neutral-800
              hover:scale-110
              transition
              ${isSidebarExpandedOrFloating ? "flex" : "hidden"} 
            `}
          >
            <Icon
              name={BiSearch}
              opts={{ size: 20 }}
              className={`
                text-neutral-300
                group-hover:text-white
              `}
            />
          </button>

          {/* adding */}
          <div className={`relative`}>
            <button
              onClick={handleActiveAddingOptions}
              className={`
                group
                outline-none
                ${
                  isSidebarExpandedOrFloating &&
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
                opts={{ size: isSidebarExpandedOrFloating ? 20 : 24 }}
                className={`
                  text-neutral-300
                  group-hover:text-white  
                `}
              />
            </button>

            {/* library adding options menu */}
            <Menu
              ref={addingMenuRef}
              activeState={{
                visible: activeAddingOptions,
                setVisible: setActiveAddingOptions,
              }}
              wrapper={{ transformOrigin: "top left" }}
              className={`fixed w-[210px]`}
            >
              {/* add new song */}
              <MenuItem
                label={libraryFm("actions.song.create")}
                icon={{ name: MdMusicNote, opts: { size: 16 } }}
                onClick={handleActiveUploadMusicModal}
              />

              {/* add new playlist */}
              <MenuItem
                label={libraryFm("actions.playlist.create")}
                icon={{ name: MdLibraryMusic, opts: { size: 16 } }}
                onClick={handleCreateNewPlaylist}
              />
            </Menu>
          </div>
        </div>
      </div>

      {/* search bar */}
      <SearchBarInput
        id="library-searchbar"
        placeholder={libraryFm("search.placeholder")}
        visible={activeLibrarySearchBar && isSidebarExpandedOrFloating}
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
