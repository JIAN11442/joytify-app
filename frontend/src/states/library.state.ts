import { create } from "zustand";

type LibraryState = {
  activeAddingOptions: boolean;
  setActiveAddingOptions: (state: boolean) => void;
};

const useLibraryState = create<LibraryState>((set) => ({
  activeAddingOptions: false,
  setActiveAddingOptions: (state) => set({ activeAddingOptions: state }),
}));

export default useLibraryState;
