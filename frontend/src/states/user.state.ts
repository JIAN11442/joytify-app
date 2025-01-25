import { create } from "zustand";
import { ResUser } from "../constants/axios-response.constant";

type UserParams = {
  user: ResUser | null;
  activeUserMenu: boolean;

  setUser: (state: ResUser | null) => void;
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
