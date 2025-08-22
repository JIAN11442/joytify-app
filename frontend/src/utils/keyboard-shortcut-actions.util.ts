import { SearchFilterOptions } from "@joytify/shared-types/constants";
import { AudioVolumeType } from "@joytify/shared-types/types";
import useKeyboardShortcutModalState from "../states/keyboard-shortcut-modal.state";
import usePlaybackControlState from "../states/playback-control.state";
import useUploadModalState from "../states/upload-modal.state";
import useSidebarState from "../states/sidebar.state";
import useNavbarState from "../states/navbar.state";
import useUserState from "../states/user.state";
import { navigate } from "../lib/navigate.lib";

export const toggleSidebar = (
  updateUserPreferencesFn: (preferences: { sidebarCollapsed: boolean }) => void
) => {
  const { collapseSideBarState, setCollapseSideBarState } = useSidebarState.getState();
  const { isCollapsed } = collapseSideBarState;

  setCollapseSideBarState({
    isCollapsed: !isCollapsed,
    isManualToggle: true,
  });

  updateUserPreferencesFn({ sidebarCollapsed: !isCollapsed });
};

export const toggleUploadModal = () => {
  const { authUser } = useUserState.getState();
  const { openUploadModal, closeUploadModal, activeUploadModal } = useUploadModalState.getState();

  if (authUser) {
    if (activeUploadModal) {
      closeUploadModal();
    } else {
      openUploadModal();
    }
  }
};

export const toggleKeyboardShortcutModal = () => {
  const { activeKeyboardShortcutModal, openKeyboardShortcutModal, closeKeyboardShortcutModal } =
    useKeyboardShortcutModalState.getState();

  if (activeKeyboardShortcutModal) {
    closeKeyboardShortcutModal();
  } else {
    openKeyboardShortcutModal();
  }
};

export const exitInputFocus = (e: KeyboardEvent, isEditing: boolean) => {
  if (isEditing && e.target instanceof HTMLElement) {
    e.target.blur();
  }
};

export const navigateToHome = () => {
  navigate("/");
};

export const navigateToSearch = () => {
  const { ALL } = SearchFilterOptions;
  const { setActiveNavSearchBar } = useNavbarState.getState();

  setActiveNavSearchBar(true);

  navigate(`/search/${ALL}`);
};

export const navigateToProfile = () => {
  const { authUser } = useUserState.getState();
  const { _id: userId } = authUser ?? {};

  navigate(`/profile/${userId}`);
};

export const navigateToSongManagement = () => {
  navigate("/manage/songs");
};

export const navigateToPlaylistManagement = () => {
  navigate("/manage/playlists");
};

export const navigateToFollowingManagement = () => {
  navigate("/manage/following");
};

export const navigateToNotificationManagement = () => {
  navigate("/manage/notifications");
};

export const navigateToAccountSettings = () => {
  navigate("/settings/account");
};

export const navigateToNotificationSettings = () => {
  navigate("/settings/notifications");
};

export const navigateToLanguageSettings = () => {
  navigate("/settings/languages");
};

export const navigateToConnectedDevicesSettings = () => {
  navigate("/settings/connected-devices");
};

export const togglePlayback = (togglePlaybackFn: () => void) => {
  const { audioSong } = usePlaybackControlState.getState();

  if (audioSong) {
    togglePlaybackFn();
  }
};

export const toggleShuffle = (shuffleSongFn: (shuffle: boolean) => void) => {
  const { audioSong, isShuffle } = usePlaybackControlState.getState();

  if (audioSong) {
    shuffleSongFn(!isShuffle);
  }
};

export const cycleRepeat = (cycleLoopFn: () => void) => {
  const { audioSong } = usePlaybackControlState.getState();

  if (audioSong) {
    cycleLoopFn();
  }
};

export const switchToNextTrack = (switchSongFn: (direction: "next" | "prev") => void) => {
  const { audioSong } = usePlaybackControlState.getState();

  if (audioSong) {
    switchSongFn("next");
  }
};

export const switchToPreviousTrack = (switchSongFn: (direction: "next" | "prev") => void) => {
  const { audioSong } = usePlaybackControlState.getState();

  if (audioSong) {
    switchSongFn("prev");
  }
};

export const seekForward = (seekAudioFn: (seekTo: number) => void, skipSeconds: number = 3) => {
  const { audioSong, progressTime } = usePlaybackControlState.getState();

  if (audioSong) {
    seekAudioFn(progressTime + skipSeconds);
  }
};

export const seekBackward = (seekAudioFn: (seekTo: number) => void, skipSeconds: number = 3) => {
  const { audioSong, progressTime } = usePlaybackControlState.getState();

  if (audioSong) {
    seekAudioFn(progressTime - skipSeconds);
  }
};

export const raiseVolume = (
  adjustVolumeFn: (value: AudioVolumeType) => void,
  increaseValue: AudioVolumeType = 0.1
) => {
  const { audioSong, audioVolume } = usePlaybackControlState.getState();

  if (audioSong) {
    const newVolume = Math.min(
      Math.round((audioVolume + increaseValue) * 100) / 100,
      1
    ) as AudioVolumeType;

    adjustVolumeFn(newVolume);
  }
};

export const lowerVolume = (
  adjustVolumeFn: (value: AudioVolumeType) => void,
  decreaseValue: AudioVolumeType = 0.1
) => {
  const { audioSong, audioVolume } = usePlaybackControlState.getState();

  if (audioSong) {
    const newVolume = Math.max(
      Math.round((audioVolume - decreaseValue) * 100) / 100,
      0
    ) as AudioVolumeType;

    adjustVolumeFn(newVolume);
  }
};

export const toggleMute = (
  adjustVolumeFn: (value: AudioVolumeType) => void,
  previousVolume: AudioVolumeType,
  setPreviousVolume: (value: AudioVolumeType) => void
) => {
  const { audioSong, audioVolume } = usePlaybackControlState.getState();

  if (audioSong) {
    if (audioVolume) {
      setPreviousVolume(audioVolume);
      adjustVolumeFn(0);
    } else {
      adjustVolumeFn(previousVolume);
    }
  }
};

export const stopAudio = (stopAudioFn: () => void) => {
  const { audioSong } = usePlaybackControlState.getState();

  if (audioSong) {
    stopAudioFn();
  }
};
