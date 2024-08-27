import { create } from "zustand";
import { resUser } from "../constants/data-type.constant";

type UserParams = {
  user: resUser | null;
  activeUserMenu: boolean;

  setUser: (user: resUser | null) => void;
  setActiveUserMenu: (state: boolean) => void;
};

const useUserState = create<UserParams>((set) => ({
  user: null,
  activeUserMenu: false,

  setUser: (user) => set({ user }),
  setActiveUserMenu: (state) => set({ activeUserMenu: state }),
}));

export default useUserState;
