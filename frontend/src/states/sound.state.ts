import { create } from "zustand";
import { SoundOutputType } from "../hooks/sound.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";

type SoundState = {
  activeSongId: string;
  songToPlay: RefactorSongResponse | null;
  songIds: string[];
  sound: SoundOutputType | null;
  isPlaying: boolean;
  onPlay: ((id: string) => void) | null;
  shuffleSongIds: ((id: string) => void) | null;

  setActiveSongId: (id: string) => void;
  setSongToPlay: (song: RefactorSongResponse | null) => void;
  setSongIds: (ids: string[]) => void;
  setSound: (sound: SoundOutputType | null) => void;
  setIsPlaying: (state: boolean) => void;
  setOnPlay: (callback: (id: string) => void) => void;
  setShuffleSongIds: (callback: (id: string) => void) => void;
};

const useSoundState = create<SoundState>((set) => ({
  activeSongId: "",
  songToPlay: null,
  songIds: [],
  sound: null,
  isPlaying: false,
  onPlay: null,
  shuffleSongIds: null,

  setActiveSongId: (id) => set({ activeSongId: id }),
  setSongToPlay: (song) => set({ songToPlay: song }),
  setSongIds: (ids) => set({ songIds: ids }),
  setSound: (sound) => set({ sound }),
  setIsPlaying: (state) => set({ isPlaying: state }),
  setOnPlay: (callback) => set({ onPlay: callback }),
  setShuffleSongIds: (callback) => set({ shuffleSongIds: callback }),
}));

export default useSoundState;
