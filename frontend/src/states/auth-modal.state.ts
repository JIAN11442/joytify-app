import { create } from "zustand";
import { AuthForOptions } from "@joytify/types/constants";
import { AuthForType } from "@joytify/types/types";

const { SIGN_IN } = AuthForOptions;

type AuthModalState = {
  activeAuthModal: boolean;
  authFor: AuthForType;

  openAuthModal: (auth: AuthForType) => void;
  closeAuthModal: () => void;
};

const useAuthModalState = create<AuthModalState>((set) => ({
  activeAuthModal: false,
  authFor: SIGN_IN,

  openAuthModal: (auth: AuthForType) => set({ activeAuthModal: true, authFor: auth }),
  closeAuthModal: () => set({ activeAuthModal: false, authFor: SIGN_IN }),
}));

export default useAuthModalState;
