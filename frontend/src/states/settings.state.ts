import { create } from "zustand";
import { AccountDeregistrationStatus, PasswordUpdateStatus } from "@joytify/types/constants";
import {
  AccountDeregistrationStatusType,
  PasswordUpdateStatusType,
  RefactorProfileUserResponse,
} from "@joytify/types/types";

type ActiveAccountDeregistrationModalType = {
  active: boolean;
  status: AccountDeregistrationStatusType;
  profileUser: RefactorProfileUserResponse | null;
};

type SettingsState = {
  activeChangePasswordModal: boolean;
  passwordChangeStatus: PasswordUpdateStatusType;
  activeAccountDeregistrationModal: ActiveAccountDeregistrationModalType;

  setActiveChangePasswordModal: (active: boolean) => void;
  setPasswordChangeStatus: (state: PasswordUpdateStatusType) => void;
  setActiveAccountDeregistrationModal: (state: ActiveAccountDeregistrationModalType) => void;
  openAccountDerergistrationModal: (profileUser: RefactorProfileUserResponse) => void;
  closeAccountDeregistrationModal: () => void;
  navigateOnDeregistrationStatus: (status: AccountDeregistrationStatus) => void;
};

const { INITIAL_CONFIRMATION } = AccountDeregistrationStatus;
const { INITIAL } = PasswordUpdateStatus;

const initialActiveAccountDeregistrationModalState = {
  active: false,
  status: INITIAL_CONFIRMATION,
  profileUser: null,
};

const useSettingsState = create<SettingsState>((set, get) => {
  const getCurrentAccountDeregistrationModalState = () => get().activeAccountDeregistrationModal;

  return {
    activeChangePasswordModal: false,
    passwordChangeStatus: INITIAL,
    activeAccountDeregistrationModal: initialActiveAccountDeregistrationModalState,

    setActiveChangePasswordModal: (state) => set({ activeChangePasswordModal: state }),
    setPasswordChangeStatus: (state) => set({ passwordChangeStatus: state }),
    setActiveAccountDeregistrationModal: (state) =>
      set({ activeAccountDeregistrationModal: state }),
    openAccountDerergistrationModal: (profileUser) =>
      set({
        activeAccountDeregistrationModal: {
          active: true,
          status: INITIAL_CONFIRMATION,
          profileUser,
        },
      }),
    closeAccountDeregistrationModal: () =>
      set({ activeAccountDeregistrationModal: initialActiveAccountDeregistrationModalState }),
    navigateOnDeregistrationStatus: (status) =>
      set({
        activeAccountDeregistrationModal: {
          ...getCurrentAccountDeregistrationModalState(),
          status,
        },
      }),
  };
});

export default useSettingsState;
