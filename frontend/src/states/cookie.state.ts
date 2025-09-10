import { create } from "zustand";
import { LoopMode } from "@joytify/types/constants";
import { RefactorSongResponse, VerifiedPlayerParams } from "@joytify/types/types";

type CookieState = {
  refactorCookiePlayer: VerifiedPlayerParams;
  setRefactorCookiePlayer: (player: VerifiedPlayerParams) => void;
};

const useCookieState = create<CookieState>((set) => ({
  refactorCookiePlayer: {
    volume: 0.5,
    shuffle: false,
    loop: LoopMode.NONE,
    playlistSongs: [],
    playbackQueue: { queue: [{} as RefactorSongResponse], currentIndex: 0 },
  },

  setRefactorCookiePlayer: (player) => set({ refactorCookiePlayer: player }),
}));

export default useCookieState;
