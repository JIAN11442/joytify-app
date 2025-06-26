import { useCallback, useEffect } from "react";

import useUserState from "../states/user.state";
import useNavbarState from "../states/navbar.state";
import useLibraryState from "../states/library.state";
import useSidebarState from "../states/sidebar.state";
import usePlaylistState from "../states/playlist.state";
import usePlaybackControl from "../hooks/playback-control.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { isEditableElement } from "../lib/element.lib";
import { navigate } from "../lib/navigate.lib";

type ShortcutKeysProps = {
  children: React.ReactNode;
};

const ShortcutKeysProvider: React.FC<ShortcutKeysProps> = ({ children }) => {
  const { authUser } = useUserState();
  const { activeNavSearchBar, setActiveNavSearchBar } = useNavbarState();
  const { collapseSideBarState, setCollapseSideBarState } = useSidebarState();
  const { setActiveAddingOptions, setActiveLibrarySearchBar } = useLibraryState();
  const { setActivePlaylistEditOptionsMenu, setActivePlaylistListOptionsMenu } = usePlaylistState();
  const { togglePlayback, audioSong } = usePlaybackControl();

  const { isCollapsed } = collapseSideBarState;

  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  const toggleSidebar = useCallback(() => {
    timeoutForDelay(() => {
      setCollapseSideBarState({
        isCollapsed: !isCollapsed,
        isManualToggle: true,
      });

      updateUserPreferencesFn({ sidebarCollapsed: !isCollapsed });
    });
  }, [isCollapsed]);

  const handleOnKeyDown = useCallback(
    (e: Event) => {
      const ekey = e as KeyboardEvent;
      const key = ekey.key;
      const isEditing = isEditableElement(ekey.target);

      // handle modifier key combinations
      if (ekey.metaKey || ekey.ctrlKey) {
        switch (key) {
          case "/":
            // toggle sidebar
            ekey.preventDefault();
            toggleSidebar();
            break;
        }
      } else if (ekey.shiftKey && !isEditing) {
        switch (key) {
          case "H":
            // to home page
            if (!activeNavSearchBar) {
              ekey.preventDefault();
              navigate("/");
            }
            break;
          case "F":
            // to search page
            if (!activeNavSearchBar) {
              ekey.preventDefault();
              timeoutForDelay(() => {
                setActiveNavSearchBar(!activeNavSearchBar);
                navigate("/search");
              });
            }
            break;
          case "P":
            // to profile page
            if (authUser) {
              ekey.preventDefault();
              navigate(`/profile/${authUser?._id}`);
            }
            break;
          case "S":
            // to account settings page
            if (authUser) {
              ekey.preventDefault();
              navigate(`/settings/account`);
            }
            break;
          case "L":
            // to language settings page
            if (authUser) {
              ekey.preventDefault();
              navigate(`/settings/languages`);
            }
            break;
          case "M":
            // to manage page
            if (authUser) {
              ekey.preventDefault();
              navigate(`/manage/songs`);
            }
            break;
        }
      } else {
        switch (key) {
          case " ":
            // toggle song play or pause
            if (audioSong && !isEditing) {
              ekey.preventDefault();
              togglePlayback();
            }
            break;
          case "Escape":
            // reset all active states
            setActiveNavSearchBar(false);
            setActiveAddingOptions(false);
            setActiveLibrarySearchBar(false);
            setActivePlaylistEditOptionsMenu(false);
            setActivePlaylistListOptionsMenu(false);
            break;
        }
      }
    },
    [audioSong, activeNavSearchBar, toggleSidebar]
  );

  useEffect(() => {
    return timeoutForEventListener(document, "keydown", handleOnKeyDown);
  }, [handleOnKeyDown]);

  return <>{children}</>;
};

export default ShortcutKeysProvider;
