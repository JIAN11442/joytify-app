import { useCallback, useEffect } from "react";
import useSidebarState from "../states/sidebar.state";
import useSoundState from "../states/sound.state";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { isEditableElement } from "../lib/element.lib";
import { navigate } from "../lib/navigate.lib";
import useNavbarState from "../states/navbar.state";
import useLibraryState from "../states/library.state";

type ShortcutKeysProps = {
  children: React.ReactNode;
};

const ShortcutKeysProvider: React.FC<ShortcutKeysProps> = ({ children }) => {
  const { collapseSideBarState, setCollapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { isPlaying, sound, activeSongId } = useSoundState();
  const { activeNavSearchBar, setActiveNavSearchBar } = useNavbarState();
  const { setActiveAddingOptions, setActiveLibrarySearchBar } =
    useLibraryState();

  const toggleSidebar = useCallback(() => {
    timeoutForDelay(() => {
      setCollapseSideBarState({
        isCollapsed: !isCollapsed,
        changeForScreenResize: false,
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

      // if ctrl or command
      if (ekey.metaKey || ekey.ctrlKey) {
        // toggle sidebar collapse state
        if (key === "/") {
          toggleSidebar();
        }
      } else if (ekey.shiftKey) {
        // navigate to home route
        if (key === "H") {
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
        }
      } else if (activeSongId && key === " ") {
        // if the current element is not editable,
        if (!isEditableElement(ekey.target)) {
          // to avoid page scrolling
          ekey.preventDefault();
          // toggle song play or pause
          togglePlayPause();
        }
      } else if (key === "Escape") {
        setActiveNavSearchBar(false);
        setActiveAddingOptions(false);
        setActiveLibrarySearchBar(false);
      }
    },
    [activeSongId, togglePlayPause, toggleSidebar]
  );

  useEffect(() => {
    return timeoutForEventListener(document, "keydown", handleOnKeyDown);
  }, [handleOnKeyDown]);

  return <>{children}</>;
};

export default ShortcutKeysProvider;
