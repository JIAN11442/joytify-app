import { create } from "zustand";
import { SoundOutputType } from "../hooks/sound.hook";
import { refactorResSong } from "../constants/axios-response.constant";

type SoundState = {
  activeSongId: string;
  songToPlay: refactorResSong | null;
  songIds: string[];
  sound: SoundOutputType | null;
  currentPlaybackTime: number;
  isPlaying: boolean;
  onPlay: ((id: string) => void) | null;
  shuffleSongIds: ((id: string) => void) | null;

  setActiveSongId: (id: string) => void;
  setSongToPlay: (song: refactorResSong | null) => void;
  setSongIds: (ids: string[]) => void;
  setSound: (sound: SoundOutputType | null) => void;
  setCurrentPlaybackTime: (seconds: number) => void;
  setIsPlaying: (state: boolean) => void;
  setOnPlay: (callback: (id: string) => void) => void;
  setShuffleSongIds: (callback: (id: string) => void) => void;
};

const useSoundState = create<SoundState>((set) => ({
  activeSongId: "",
  songToPlay: null,
  songIds: [],
  sound: null,
  currentPlaybackTime: 0,
  isPlaying: false,
  onPlay: null,
  shuffleSongIds: null,

  setActiveSongId: (id: string) => set({ activeSongId: id }),
  setSongToPlay: (song) => set({ songToPlay: song }),
  setSongIds: (ids: string[]) => set({ songIds: ids }),
  setSound: (sound) => set({ sound }),
  setCurrentPlaybackTime: (seconds: number) =>
    set({ currentPlaybackTime: seconds }),
  setIsPlaying: (state: boolean) => set({ isPlaying: state }),
  setOnPlay: (callback) => set({ onPlay: callback }),
  setShuffleSongIds: (callback) => set({ shuffleSongIds: callback }),
}));

export default useSoundState;
