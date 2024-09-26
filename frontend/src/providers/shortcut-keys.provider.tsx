import { useCallback, useEffect } from "react";
import useSidebarState from "../states/sidebar.state";
import useSoundState from "../states/sound.state";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";

type ShortcutKeysProps = {
  children: React.ReactNode;
};

const ShortcutKeysProvider: React.FC<ShortcutKeysProps> = ({ children }) => {
  const { collapseSideBarState, setCollapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;
  const { isPlaying, sound, activeSongId } = useSoundState();

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

      // if ctrl or command
      if (ekey.metaKey || ekey.ctrlKey) {
        // plus '/' keyboard
        if (ekey.key === "/") {
          // toggle sidebar collapse state
          toggleSidebar();
        }
      } else if (activeSongId && ekey.key === " ") {
        // to avoid page scrolling
        ekey.preventDefault();

        // toggle song play or pause
        togglePlayPause();
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
