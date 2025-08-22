import { ScopedFormatMessage } from "../hooks/intl.hook";
import { KEYBOARD_SHORTCUTS } from "@joytify/shared-types/constants";

type KeyboardShortcutItem = {
  id: string;
  action: string;
  macosKey: string[];
  windowsKey: string[];
};

type KeyboardShortcutCategory = {
  id: string;
  title: string;
  items: KeyboardShortcutItem[];
};

export const getKeyboardShortcutCategories = (
  fm: ScopedFormatMessage
): KeyboardShortcutCategory[] => {
  const keyboardShortcutSectionFm = fm("keyboard.shortcut.section");
  const keyboardShortcutActionFm = fm("keyboard.shortcut.action");

  const ks = KEYBOARD_SHORTCUTS;

  const categories = [
    {
      id: "keyboard-shortcut-section-general",
      title: keyboardShortcutSectionFm("general"),
      items: [
        {
          id: ks.TOGGLE_SIDEBAR,
          action: keyboardShortcutActionFm("toggleSidebar"),
          macosKey: ["⌘", "/"],
          windowsKey: ["Ctrl", "/"],
        },
        {
          id: ks.TOGGLE_UPLOAD_MODAL,
          action: keyboardShortcutActionFm("toggleUploadModal"),
          macosKey: ["⌘", "U"],
          windowsKey: ["Ctrl", "U"],
        },
        {
          id: ks.TOGGLE_KEYBOARD_SHORTCUT_MODAL,
          action: keyboardShortcutActionFm("toggleKeyboardShortcutModal"),
          macosKey: ["⌘", "K"],
          windowsKey: ["Ctrl", "K"],
        },
        {
          id: ks.EXIT_INPUT_FOCUS,
          action: keyboardShortcutActionFm("exitInputFocus"),
          macosKey: ["Esc"],
        },
      ],
    },
    {
      id: "keyboard-shortcut-section-navigation",
      title: keyboardShortcutSectionFm("navigation"),
      items: [
        {
          id: ks.NAVIGATE_HOME,
          action: keyboardShortcutActionFm("navigate.homepage"),
          macosKey: ["⇧", "H"],
          windowsKey: ["Shift", "H"],
        },
        {
          id: ks.NAVIGATE_SEARCH,
          action: keyboardShortcutActionFm("navigate.searchpage"),
          macosKey: ["⇧", "F"],
          windowsKey: ["Shift", "F"],
        },
        {
          id: ks.NAVIGATE_PROFILE,
          action: keyboardShortcutActionFm("navigate.profilepage"),
          macosKey: ["⇧", "U"],
          windowsKey: ["Shift", "U"],
        },
        {
          id: ks.NAVIGATE_MANAGE_SONGS,
          action: keyboardShortcutActionFm("navigate.manage.songs"),
          macosKey: ["⇧", "S"],
          windowsKey: ["Shift", "S"],
        },
        {
          id: ks.NAVIGATE_MANAGE_PLAYLISTS,
          action: keyboardShortcutActionFm("navigate.manage.playlists"),
          macosKey: ["⇧", "P"],
          windowsKey: ["Shift", "P"],
        },
        {
          id: ks.NAVIGATE_MANAGE_FOLLOWING,
          action: keyboardShortcutActionFm("navigate.manage.following"),
          macosKey: ["⇧", "K"],
          windowsKey: ["Shift", "K"],
        },
        {
          id: ks.NAVIGATE_MANAGE_NOTIFICATIONS,
          action: keyboardShortcutActionFm("navigate.manage.notifications"),
          macosKey: ["⇧", "I"],
          windowsKey: ["Shift", "I"],
        },
        {
          id: ks.NAVIGATE_SETTINGS_ACCOUNT,
          action: keyboardShortcutActionFm("navigate.settings.account"),
          macosKey: ["⇧", "A"],
          windowsKey: ["Shift", "A"],
        },
        {
          id: ks.NAVIGATE_SETTINGS_NOTIFICATIONS,
          action: keyboardShortcutActionFm("navigate.settings.notifications"),
          macosKey: ["⇧", "N"],
          windowsKey: ["Shift", "N"],
        },
        {
          id: ks.NAVIGATE_SETTINGS_LANGUAGE,
          action: keyboardShortcutActionFm("navigate.settings.language"),
          macosKey: ["⇧", "L"],
          windowsKey: ["Shift", "L"],
        },
        {
          id: ks.NAVIGATE_SETTINGS_CONNECTED_DEVICES,
          action: keyboardShortcutActionFm("navigate.settings.connectedDevices"),
          macosKey: ["⇧", "D"],
          windowsKey: ["Shift", "D"],
        },
      ],
    },
    {
      id: "keyboard-shortcut-section-playback",
      title: keyboardShortcutSectionFm("playback"),
      items: [
        {
          id: ks.TOGGLE_PLAYBACK,
          action: keyboardShortcutActionFm("togglePlayback"),
          macosKey: ["Space"],
        },
        {
          id: ks.TOGGLE_SHUFFLE,
          action: keyboardShortcutActionFm("toggleShuffle"),
          macosKey: ["⌥", "S"],
          windowsKey: ["Alt", "S"],
        },
        {
          id: ks.CYCLE_REPEAT,
          action: keyboardShortcutActionFm("cycleRepeat"),
          macosKey: ["⌥", "R"],
          windowsKey: ["Alt", "R"],
        },
        {
          id: ks.NEXT,
          action: keyboardShortcutActionFm("next"),
          macosKey: ["⌥", "→"],
          windowsKey: ["Alt", "→"],
        },
        {
          id: ks.PREVIOUS,
          action: keyboardShortcutActionFm("previous"),
          macosKey: ["⌥", "←"],
          windowsKey: ["Alt", "←"],
        },
        {
          id: ks.SEEK_FORWARD,
          action: keyboardShortcutActionFm("seekForward"),
          macosKey: ["→"],
        },
        {
          id: ks.SEEK_BACKWARD,
          action: keyboardShortcutActionFm("seekBackward"),
          macosKey: ["←"],
        },
        {
          id: ks.RAISE_VOLUME,
          action: keyboardShortcutActionFm("raiseVolume"),
          macosKey: ["⌥", "↑"],
          windowsKey: ["Alt", "↑"],
        },
        {
          id: ks.LOWER_VOLUME,
          action: keyboardShortcutActionFm("lowerVolume"),
          macosKey: ["⌥", "↓"],
          windowsKey: ["Alt", "↓"],
        },
        {
          id: ks.TOGGLE_MUTE,
          action: keyboardShortcutActionFm("toggleMute"),
          macosKey: ["⌥", "M"],
          windowsKey: ["Alt", "M"],
        },
        {
          id: ks.STOP_AUDIO,
          action: keyboardShortcutActionFm("stopAudio"),
          macosKey: ["⌥", "T"],
          windowsKey: ["Alt", "T"],
        },
      ],
    },
  ] as KeyboardShortcutCategory[];

  return categories;
};
