import { create } from "zustand";

import { SongLoopOptions } from "../constants/loop-mode.constant";
import { SongLoopType } from "../types/loop-mode.type";
import { Volume } from "../types/volume.type";

type PlayerState = {
  isShuffle: boolean;
  loopType: SongLoopType;
  volume: Volume;

  setIsShuffle: (state: boolean) => void;
  setLoopType: (state: SongLoopType) => void;
  setVolume: (value: Volume) => void;
};

const usePlayerState = create<PlayerState>((set) => ({
  isShuffle: false,
  loopType: SongLoopOptions.OFF,
  volume: 0.5,

  setIsShuffle: (state: boolean) => set({ isShuffle: state }),
  setLoopType: (state: SongLoopType) => set({ loopType: state }),
  setVolume: (value: Volume) => set({ volume: value }),
}));

export default usePlayerState;
