import { useCallback, useEffect } from "react";

import useUserState from "../states/user.state";
import useSoundState from "../states/sound.state";
import useNavbarState from "../states/navbar.state";
import useLibraryState from "../states/library.state";
import useSidebarState from "../states/sidebar.state";
import usePlaylistState from "../states/playlist.state";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { isEditableElement } from "../lib/element.lib";
import { navigate } from "../lib/navigate.lib";

type ShortcutKeysProps = {
  children: React.ReactNode;
};

const ShortcutKeysProvider: React.FC<ShortcutKeysProps> = ({ children }) => {
  const { authUser } = useUserState();
  const { collapseSideBarState, setCollapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { isPlaying, sound, activeSongId } = useSoundState();
  const { activeNavSearchBar, setActiveNavSearchBar } = useNavbarState();
  const { setActiveAddingOptions, setActiveLibrarySearchBar } = useLibraryState();
  const { setActivePlaylistEditOptionsMenu, setActivePlaylistListOptionsMenu } = usePlaylistState();

  const { mutate: updateUserPreferences } = useUpdateUserPreferencesMutation();

  const toggleSidebar = useCallback(() => {
    timeoutForDelay(() => {
      setCollapseSideBarState({
        isCollapsed: !isCollapsed,
        isManualToggle: true,
      });

      updateUserPreferences({
        collapseSidebar: !isCollapsed,
      });
    });
  }, [isCollapsed]);

  const togglePlayPause = useCallback(() => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    }
  }, [sound, isPlaying]);

  const handleOnKeyDown = useCallback(
    (e: Event) => {
      const ekey = e as KeyboardEvent;
      const key = ekey.key;
      const isEditing = isEditableElement(ekey.target);

      // if ctrl or command
      if (ekey.metaKey || ekey.ctrlKey) {
        // toggle sidebar collapse state
        if (key === "/") {
          toggleSidebar();
        }
      } else if (ekey.shiftKey) {
        if (!isEditing) {
          // navigate to home route
          if (!activeNavSearchBar && key === "H") {
            navigate("/");
          }
          // navigate to search route
          else if (key === "F") {
            if (!activeNavSearchBar) {
              timeoutForDelay(() => {
                setActiveNavSearchBar(!activeNavSearchBar);
                navigate("/search");
              });
            }
          } else if (key === "P" && authUser) {
            navigate(`/profile/${authUser?._id}`);
          }
        }
      } else if (activeSongId && key === " ") {
        // if the current element is not editable,
        if (!isEditing) {
          // to avoid page scrolling
          ekey.preventDefault();
          // toggle song play or pause
          togglePlayPause();
        }
      } else if (key === "Escape") {
        // navbar
        setActiveNavSearchBar(false);

        // library
        setActiveAddingOptions(false);
        setActiveLibrarySearchBar(false);

        // playlist
        setActivePlaylistEditOptionsMenu(false);
        setActivePlaylistListOptionsMenu(false);
      }
    },
    [activeSongId, activeNavSearchBar, togglePlayPause, toggleSidebar]
  );

  useEffect(() => {
    return timeoutForEventListener(document, "keydown", handleOnKeyDown);
  }, [handleOnKeyDown]);

  return <>{children}</>;
};

export default ShortcutKeysProvider;
