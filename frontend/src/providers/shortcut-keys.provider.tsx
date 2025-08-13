import { useCallback, useEffect, useRef } from "react";

import usePlaybackControl from "../hooks/playback-control.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import useUserState from "../states/user.state";
import useNavbarState from "../states/navbar.state";
import useLibraryState from "../states/library.state";
import useSidebarState from "../states/sidebar.state";
import usePlaylistState from "../states/playlist.state";
import useUploadModalState from "../states/upload-modal.state";
import usePlaybackControlState from "../states/playback-control.state";
import { timeoutForEventListener } from "../lib/timeout.lib";
import { isEditableElement } from "../lib/element.lib";
import { navigate } from "../lib/navigate.lib";

type ShortcutKeysProps = {
  children: React.ReactNode;
};

const ShortcutKeysProvider: React.FC<ShortcutKeysProps> = ({ children }) => {
  const { togglePlayback } = usePlaybackControl();
  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  // Debounce for rapid key presses
  const lastKeyPressRef = useRef<{ key: string; time: number }>({ key: "", time: 0 });
  const DEBOUNCE_DELAY = 200;
  const { ALL } = SearchFilterOptions;

  const toggleSidebar = useCallback(() => {
    const { isCollapsed } = useSidebarState.getState().collapseSideBarState;
    const { setCollapseSideBarState } = useSidebarState.getState();

    setCollapseSideBarState({
      isCollapsed: !isCollapsed,
      isManualToggle: true,
    });

    updateUserPreferencesFn({ sidebarCollapsed: !isCollapsed });
  }, [updateUserPreferencesFn]);

  const handleOnKeyDown = useCallback(
    (e: Event) => {
      const ekey = e as KeyboardEvent;
      const key = ekey.key;
      const isEditing = isEditableElement(ekey.target);
      const currentTime = Date.now();

      // Debounce rapid key presses
      if (
        lastKeyPressRef.current.key === key &&
        currentTime - lastKeyPressRef.current.time < DEBOUNCE_DELAY
      ) {
        return;
      }
      lastKeyPressRef.current = { key, time: currentTime };

      // Get latest state from stores
      const { authUser } = useUserState.getState();
      const { audioSong } = usePlaybackControlState.getState();
      const { activeNavSearchBar, setActiveNavSearchBar } = useNavbarState.getState();
      const { setActiveAddingOptions, setActiveLibrarySearchBar } = useLibraryState.getState();
      const { setActivePlaylistEditOptionsMenu } = usePlaylistState.getState();
      const { openUploadModal } = useUploadModalState.getState();

      // handle modifier key combinations
      if (ekey.metaKey || ekey.ctrlKey) {
        switch (key) {
          case "/":
            // toggle sidebar
            ekey.preventDefault();
            toggleSidebar();
            break;
          case "u":
            // active upload modal
            if (authUser) {
              ekey.preventDefault();
              openUploadModal();
            }
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
              setActiveNavSearchBar(true);
              navigate(`/search/${ALL}`);
            }
            break;
          case "P":
            // to profile page
            if (authUser) {
              ekey.preventDefault();
              navigate(`/profile/${authUser._id}`);
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
            // blur focused input if editing
            if (isEditing && ekey.target instanceof HTMLElement) {
              ekey.target.blur();
            }

            // reset all active states
            setActiveNavSearchBar(false);
            setActiveAddingOptions(false);
            setActiveLibrarySearchBar(false);
            setActivePlaylistEditOptionsMenu(false);
            break;
        }
      }
    },
    [toggleSidebar, togglePlayback]
  );

  useEffect(() => {
    const cleanup = timeoutForEventListener(document, "keydown", handleOnKeyDown);
    return cleanup;
  }, [handleOnKeyDown]);

  return <>{children}</>;
};

export default ShortcutKeysProvider;
