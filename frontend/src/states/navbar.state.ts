import { create } from "zustand";

type NavbarState = {
  activeNavSearchBar: boolean;
  adjustNavSearchBarPosition: boolean;

  setActiveNavSearchBar: (state: boolean) => void;
  setAdjustNavSearchBarPosition: (state: boolean) => void;
};

const useNavbarState = create<NavbarState>((set) => ({
  activeNavSearchBar: false,
  adjustNavSearchBarPosition: false,

  setActiveNavSearchBar: (state) => set({ activeNavSearchBar: state }),
  setAdjustNavSearchBarPosition: (state) =>
    set({ adjustNavSearchBarPosition: state }),
}));

export default useNavbarState;
