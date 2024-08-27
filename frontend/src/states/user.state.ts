import { create } from "zustand";
import { resUser } from "../constants/data-type.constant";

type QueryStateParams = {
  user: resUser | null;
  isLoading: boolean;
};

type UserParams = {
  queryState: QueryStateParams;
  isQueryError: boolean;
  activeUserMenu: boolean;

  setQueryState: (state: QueryStateParams) => void;
  setIsQueryError: (state: boolean) => void;
  setActiveUserMenu: (state: boolean) => void;
  closeUserMenu: () => void;
};

const useUserState = create<UserParams>((set) => ({
  user: null,
  loading: false,
  queryState: {
    user: null,
    isLoading: false,
  },
  isQueryError: false,
  activeUserMenu: false,

  setQueryState: (state) => set({ queryState: state }),
  setIsQueryError: (state) => set({ isQueryError: state }),
  setActiveUserMenu: (state) => set({ activeUserMenu: state }),
  closeUserMenu: () => set({ activeUserMenu: false }),
}));

export default useUserState;
