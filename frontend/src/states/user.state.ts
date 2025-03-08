import { create } from "zustand";
import { ResUser } from "../constants/axios-response.constant";
import {
  PasswordResetStatus,
  PasswordResetStatusType,
} from "../constants/user.constant";

type UserParams = {
  user: ResUser | null;
  activeUserMenu: boolean;
  passwordResetStatus: PasswordResetStatusType;

  setUser: (state: ResUser | null) => void;
  setActiveUserMenu: (state: boolean) => void;
  closeUserMenu: () => void;
  setPasswordResetStatus: (state: PasswordResetStatusType) => void;
};

const useUserState = create<UserParams>((set) => ({
  user: null,
  activeUserMenu: false,
  isPasswordResetSuccessful: null,
  passwordResetStatus: PasswordResetStatus.INITIAL,

  setUser: (state) => set({ user: state }),
  setActiveUserMenu: (state) => set({ activeUserMenu: state }),
  closeUserMenu: () => set({ activeUserMenu: false }),
  setPasswordResetStatus: (state) => set({ passwordResetStatus: state }),
}));

export default useUserState;
