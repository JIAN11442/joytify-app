import { useEffect, useMemo, useState } from "react";
import { useScopedIntl } from "../hooks/intl.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { getKeyboardShortcutCategories } from "../contents/keyboard-shortcut-categories.content";
import { KEYBOARD_SHORTCUTS } from "@joytify/shared-types/constants";
import usePlaybackControlState from "../states/playback-control.state";
import { AudioVolumeType } from "@joytify/shared-types/types";

import {
  toggleSidebar,
  toggleUploadModal,
  navigateToHome,
  navigateToProfile,
  navigateToSearch,
  navigateToSongManagement,
  navigateToPlaylistManagement,
  navigateToFollowingManagement,
  navigateToNotificationManagement,
  navigateToAccountSettings,
  navigateToNotificationSettings,
  navigateToLanguageSettings,
  navigateToConnectedDevicesSettings,
  togglePlayback,
  exitInputFocus,
  toggleKeyboardShortcutModal,
  toggleShuffle,
  cycleRepeat,
  switchToNextTrack,
  switchToPreviousTrack,
  seekForward,
  seekBackward,
  raiseVolume,
  lowerVolume,
  toggleMute,
  stopAudio,
} from "../utils/keyboard-shortcut-actions.util";
import { isEditableElement } from "../lib/element.lib";
import { resetMusicAudioInstance } from "../lib/music-audio.lib";

type KeyboardShortcutProps = {
  children: React.ReactNode;
};

type KeyboardShortcutHandlerProps = {
  e: KeyboardEvent;
  isEditing: boolean;
  updateUserPreferencesFn: (preferences: { sidebarCollapsed: boolean }) => void;
  togglePlaybackFn: () => void;
  shuffleSongFn: (shuffle: boolean) => void;
  cycleLoopFn: () => void;
  switchSongFn: (direction: "next" | "prev") => void;
  seekAudioFn: (seekTo: number) => void;
  adjustVolumeFn: (value: AudioVolumeType) => void;
  previousVolume: AudioVolumeType;
  setPreviousVolume: (value: AudioVolumeType) => void;
  stopAudioFn: () => void;
};

const ks = KEYBOARD_SHORTCUTS;

const normalizeKey = (e: KeyboardEvent) => {
  const specialKeyMap: Record<string, string> = {
    " ": "Space",
    Spacebar: "Space",
    Enter: "Enter",
    Tab: "Tab",
    Escape: "Esc",
    Backspace: "Backspace",
    Delete: "Del",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };

  const keyName = e.code?.startsWith("Key")
    ? e.code.replace("Key", "").toLowerCase()
    : specialKeyMap[e.key]?.toLowerCase() || e.key.toLowerCase();

  const key = [e.metaKey && "⌘", e.ctrlKey && "^", e.shiftKey && "⇧", e.altKey && "⌥", keyName]
    .filter(Boolean)
    .join("+");

  return key;
};

const createHandlers = (params: KeyboardShortcutHandlerProps): Record<string, () => void> => {
  const {
    e,
    isEditing,
    updateUserPreferencesFn,
    togglePlaybackFn,
    shuffleSongFn,
    cycleLoopFn,
    switchSongFn,
    seekAudioFn,
    adjustVolumeFn,
    previousVolume,
    setPreviousVolume,
    stopAudioFn,
  } = params;

  return {
    [ks.TOGGLE_SIDEBAR]: () => toggleSidebar(updateUserPreferencesFn),
    [ks.TOGGLE_UPLOAD_MODAL]: () => toggleUploadModal(),
    [ks.TOGGLE_KEYBOARD_SHORTCUT_MODAL]: () => toggleKeyboardShortcutModal(),
    [ks.EXIT_INPUT_FOCUS]: () => exitInputFocus(e, isEditing),

    [ks.NAVIGATE_HOME]: () => navigateToHome(),
    [ks.NAVIGATE_SEARCH]: () => navigateToSearch(),
    [ks.NAVIGATE_PROFILE]: () => navigateToProfile(),
    [ks.NAVIGATE_MANAGE_SONGS]: () => navigateToSongManagement(),
    [ks.NAVIGATE_MANAGE_PLAYLISTS]: () => navigateToPlaylistManagement(),
    [ks.NAVIGATE_MANAGE_FOLLOWING]: () => navigateToFollowingManagement(),
    [ks.NAVIGATE_MANAGE_NOTIFICATIONS]: () => navigateToNotificationManagement(),
    [ks.NAVIGATE_SETTINGS_ACCOUNT]: () => navigateToAccountSettings(),
    [ks.NAVIGATE_SETTINGS_NOTIFICATIONS]: () => navigateToNotificationSettings(),
    [ks.NAVIGATE_SETTINGS_LANGUAGE]: () => navigateToLanguageSettings(),
    [ks.NAVIGATE_SETTINGS_CONNECTED_DEVICES]: () => navigateToConnectedDevicesSettings(),

    [ks.TOGGLE_PLAYBACK]: () => togglePlayback(togglePlaybackFn),
    [ks.TOGGLE_SHUFFLE]: () => toggleShuffle(shuffleSongFn),
    [ks.CYCLE_REPEAT]: () => cycleRepeat(cycleLoopFn),
    [ks.NEXT]: () => switchToNextTrack(switchSongFn),
    [ks.PREVIOUS]: () => switchToPreviousTrack(switchSongFn),
    [ks.SEEK_FORWARD]: () => seekForward(seekAudioFn, 5),
    [ks.SEEK_BACKWARD]: () => seekBackward(seekAudioFn, 5),
    [ks.RAISE_VOLUME]: () => raiseVolume(adjustVolumeFn, 0.1),
    [ks.LOWER_VOLUME]: () => lowerVolume(adjustVolumeFn, 0.1),
    [ks.TOGGLE_MUTE]: () => toggleMute(adjustVolumeFn, previousVolume, setPreviousVolume),
    [ks.STOP_AUDIO]: () => stopAudio(stopAudioFn),
  };
};

export const KeyboardShortcutKeysProvider: React.FC<KeyboardShortcutProps> = ({ children }) => {
  const { fm } = useScopedIntl();
  const {
    cycleLoop: cycleLoopFn,
    seekAudio: seekAudioFn,
    switchSong: switchSongFn,
    shuffleSong: shuffleSongFn,
    adjustVolume: adjustVolumeFn,
    togglePlayback: togglePlaybackFn,
  } = usePlaybackControl();
  const { audioVolume } = usePlaybackControlState();
  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  const [previousVolume, setPreviousVolume] = useState<AudioVolumeType>(audioVolume);

  const categories = getKeyboardShortcutCategories(fm);

  const shortcutMap = useMemo(() => {
    const map = categories.reduce<Record<string, string>>((acc, category) => {
      category.items.forEach(({ id: itemId, macosKey, windowsKey }) => {
        if (!itemId) return;
        const keys = (macosKey ?? windowsKey ?? []).map((k) => k.toLowerCase());
        acc[keys.join("+")] = itemId;
      });
      return acc;
    }, {});

    return map;
  }, [categories]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isEditing = isEditableElement(e.target);
      const comboEventKeys = normalizeKey(e);
      const handlers = createHandlers({
        e,
        isEditing,
        updateUserPreferencesFn,
        togglePlaybackFn,
        shuffleSongFn,
        cycleLoopFn,
        switchSongFn,
        seekAudioFn,
        adjustVolumeFn,
        previousVolume,
        setPreviousVolume,
        stopAudioFn: resetMusicAudioInstance,
      });

      const handlerId = shortcutMap[comboEventKeys];

      if (handlerId !== ks.EXIT_INPUT_FOCUS && isEditing) return;

      if (handlerId && handlers[handlerId]) {
        e.preventDefault();
        handlers[handlerId]();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [
    shortcutMap,
    updateUserPreferencesFn,
    togglePlaybackFn,
    shuffleSongFn,
    cycleLoopFn,
    switchSongFn,
    seekAudioFn,
    adjustVolumeFn,
    previousVolume,
    setPreviousVolume,
    resetMusicAudioInstance,
  ]);

  return <>{children}</>;
};
