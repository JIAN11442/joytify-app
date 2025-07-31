import { isNumber } from "lodash";
import usePlaybackControlState from "../states/playback-control.state";
import { LoopMode } from "@joytify/shared-types/constants";
import { Queue } from "@joytify/shared-types/types";

let musicAudio: HTMLAudioElement | null = null;

export const getMusicAudioInstance = () => {
  if (!musicAudio) {
    musicAudio = new Audio();
    const { audioVolume } = usePlaybackControlState.getState();

    // initialize audio volume
    if (isNumber(audioVolume) && isFinite(audioVolume) && audioVolume >= 0 && audioVolume <= 1) {
      musicAudio.volume = audioVolume;
    } else {
      musicAudio.volume = 1;
    }
  }

  return musicAudio;
};

export const resetMusicAudioInstance = () => {
  const { setPlaybackQueue, setPlaylistSongs, setIsShuffle, setLoopMode } =
    usePlaybackControlState.getState();

  if (musicAudio) {
    musicAudio.pause();
    musicAudio.src = "";
    musicAudio.currentTime = 0;
    musicAudio.load();
    musicAudio = null;

    setPlaybackQueue({ queue: [] as unknown as Queue, currentIndex: 0 });
    setPlaylistSongs([]);
    setIsShuffle(false);
    setLoopMode(LoopMode.NONE);
  }
};
