import { create } from "zustand";

type LibraryState = {
  activeAddingOptions: boolean;
  playlistSearchVal: string | null;

  setActiveAddingOptions: (state: boolean) => void;
  setPlaylistSearchVal: (val: string | null) => void;
};

const useLibraryState = create<LibraryState>((set) => ({
  activeAddingOptions: false,
  playlistSearchVal: null,

  setActiveAddingOptions: (state) => set({ activeAddingOptions: state }),
  setPlaylistSearchVal: (val) => set({ playlistSearchVal: val }),
}));

export default useLibraryState;
