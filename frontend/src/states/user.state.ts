import { create } from "zustand";
import { resUser } from "../constants/axios-response.constant";

type UserParams = {
  user: resUser | null;
  activeUserMenu: boolean;

  setUser: (state: resUser | null) => void;
  setActiveUserMenu: (state: boolean) => void;
  closeUserMenu: () => void;
};

const useUserState = create<UserParams>((set) => ({
  user: null,
  activeUserMenu: false,

  setUser: (state) => set({ user: state }),
  setActiveUserMenu: (state) => set({ activeUserMenu: state }),
  closeUserMenu: () => set({ activeUserMenu: false }),
}));

export default useUserState;
