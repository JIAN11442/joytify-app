import { create } from "zustand";
import AuthForType from "../constants/auth-type.constant";
import AuthForOptions from "../constants/auth-type.constant";

type AuthModalState = {
  isActive: boolean;
  authFor: AuthForType;

  openAuthModal: (auth: AuthForType) => void;
  closeAuthModal: () => void;
};

const useAuthModalState = create<AuthModalState>((set) => ({
  isActive: false,
  authFor: AuthForOptions.SIGN_IN,

  openAuthModal: (auth: AuthForType) => set({ isActive: true, authFor: auth }),
  closeAuthModal: () =>
    set({ isActive: false, authFor: AuthForOptions.SIGN_IN }),
}));

export default useAuthModalState;
