import { create } from "zustand";
import AuthForOptions, { AuthForType } from "../constants/auth.constant";

type AuthModalState = {
  activeAuthModal: boolean;
  authFor: AuthForType;

  openAuthModal: (auth: AuthForType) => void;
  closeAuthModal: () => void;
};

const useAuthModalState = create<AuthModalState>((set) => ({
  activeAuthModal: false,
  authFor: AuthForOptions.SIGN_IN,

  openAuthModal: (auth: AuthForType) =>
    set({ activeAuthModal: true, authFor: auth }),
  closeAuthModal: () =>
    set({ activeAuthModal: false, authFor: AuthForOptions.SIGN_IN }),
}));

export default useAuthModalState;
