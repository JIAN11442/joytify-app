import { create } from "zustand";
import { LoopMode } from "@joytify/types/constants";
import {
  AudioVolumeType,
  LoopModeType,
  PlaybackQueueWithObjects,
  RefactorSongResponse,
} from "@joytify/types/types";

type PlaybackControlState = {
  playlistSongs: RefactorSongResponse[];
  playbackQueue: PlaybackQueueWithObjects;
  audioSong: RefactorSongResponse | null;
  isPlaying: boolean;
  isShuffle: boolean;
  loopMode: LoopModeType;
  progressTime: number;
  playbackTime: number;
  audioVolume: AudioVolumeType;
  initializedFormCookie: boolean;

  setPlaylistSongs: (songs: RefactorSongResponse[]) => void;
  setPlaybackQueue: (playbackQueue: PlaybackQueueWithObjects) => void;
  setIsPlaying: (state: boolean) => void;
  setIsShuffle: (state: boolean) => void;
  setLoopMode: (state: LoopModeType) => void;
  setProgressTime: (time: number) => void;
  setPlaybackTime: (time: number) => void;
  setAudioVolume: (volume: AudioVolumeType) => void;
  setInitializedFormCookie: (state: boolean) => void;
};

const usePlaybackControlState = create<PlaybackControlState>((set) => ({
  playlistSongs: [],
  playbackQueue: { queue: [{} as RefactorSongResponse], currentIndex: 0 },
  audioSong: null,
  isPlaying: false,
  isShuffle: false,
  loopMode: LoopMode.NONE,
  progressTime: 0,
  playbackTime: 0,
  audioVolume: 0.5,
  initializedFormCookie: false,

  setPlaylistSongs: (songs) => set({ playlistSongs: songs }),
  setPlaybackQueue: (playbackQueue) =>
    set(() => {
      const { queue, currentIndex } = playbackQueue;

      return {
        playbackQueue,
        audioSong: queue[currentIndex]?.songUrl ? queue[currentIndex] : null,
      };
    }),
  setIsPlaying: (state) => set({ isPlaying: state }),
  setIsShuffle: (state) => set({ isShuffle: state }),
  setLoopMode: (state) => set({ loopMode: state }),
  setProgressTime: (time) => set({ progressTime: time }),
  setPlaybackTime: (time) => set({ playbackTime: time }),
  setAudioVolume: (volume) => set({ audioVolume: volume }),
  setInitializedFormCookie: (state) => set({ initializedFormCookie: state }),
}));

export default usePlaybackControlState;
