import { create } from "zustand";
import { RefactorSongResponse } from "@joytify/shared-types/types";

type SongState = {
  songs: RefactorSongResponse[] | null;
  setSongs: (songs: RefactorSongResponse[] | null) => void;
};

const useSongState = create<SongState>((set) => ({
  songs: null,
  setSongs: (songs) => set({ songs }),
}));

export default useSongState;
