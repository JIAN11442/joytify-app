import { create } from "zustand";
import AuthForOptions, { AuthForType } from "../constants/auth.constant";

type AuthModalState = {
  activeModal: boolean;
  authFor: AuthForType;

  openAuthModal: (auth: AuthForType) => void;
  closeAuthModal: () => void;
};

const useAuthModalState = create<AuthModalState>((set) => ({
  activeModal: false,
  authFor: AuthForOptions.SIGN_IN,

  openAuthModal: (auth: AuthForType) =>
    set({ activeModal: true, authFor: auth }),
  closeAuthModal: () =>
    set({ activeModal: false, authFor: AuthForOptions.SIGN_IN }),
}));

export default useAuthModalState;
