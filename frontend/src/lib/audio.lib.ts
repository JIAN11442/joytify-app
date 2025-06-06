import { isNumber } from "lodash";
import usePlaybackControlState from "../states/playback-control.state";
import { LoopMode } from "@joytify/shared-types/constants";
import { Queue } from "@joytify/shared-types/types";

let audio: HTMLAudioElement | null = null;

export const getAudioInstance = () => {
  if (!audio) {
    audio = new Audio();
    const { audioVolume } = usePlaybackControlState.getState();

    // initialize audio volume
    if (isNumber(audioVolume) && isFinite(audioVolume) && audioVolume >= 0 && audioVolume <= 1) {
      audio.volume = audioVolume;
    } else {
      audio.volume = 1;
    }
  }

  return audio;
};

export const resetAudioInstance = () => {
  const { setPlaybackQueue, setPlaylistSongs, setIsShuffle, setLoopMode } =
    usePlaybackControlState.getState();

  if (audio) {
    audio.pause();
    audio.src = "";
    audio.currentTime = 0;
    audio.load();
    audio = null;

    setPlaybackQueue({ queue: [] as unknown as Queue, currentIndex: 0 });
    setPlaylistSongs([]);
    setIsShuffle(false);
    setLoopMode(LoopMode.NONE);
  }
};
