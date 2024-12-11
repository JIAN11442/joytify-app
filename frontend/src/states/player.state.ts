import { create } from "zustand";
import SongLoopOptions, {
  SongLoopType,
} from "../constants/song-loop-mode.constant";
import { Volume } from "../constants/volume.constant";

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
