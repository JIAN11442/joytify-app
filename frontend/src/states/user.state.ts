import { create } from "zustand";
import { PasswordUpdateStatus } from "@joytify/shared-types/constants";
import {
  AuthUserResponse,
  RefactorProfileUserResponse,
  ProfileCollectionInfoResponse,
  PasswordUpdateStatusType,
} from "@joytify/shared-types/types";

type ActiveEditProfileModal = {
  active: boolean;
  profileUser: RefactorProfileUserResponse | null;
};

type UserParams = {
  authUser: AuthUserResponse | null;
  profileUser: RefactorProfileUserResponse | null;
  profileCollectionDocs: ProfileCollectionInfoResponse | null;
  isFetchingAuthUser: boolean;

  activeUserMenu: boolean;
  activeProfileOptionsMenu: boolean;
  activeProfileEditModal: ActiveEditProfileModal;
  passwordResetStatus: PasswordUpdateStatusType;

  closeProfileEditModal: () => void;

  setAuthUser: (data: AuthUserResponse | null) => void;
  setProfileUser: (data: RefactorProfileUserResponse | null) => void;
  setProfileCollectionDocs: (data: ProfileCollectionInfoResponse | null) => void;
  setIsFetchingAuthUser: (state: boolean) => void;
  setActiveUserMenu: (state: boolean) => void;
  setActiveProfileOptionsMenu: (state: boolean) => void;
  setActiveProfileEditModal: (state: ActiveEditProfileModal) => void;
  setPasswordResetStatus: (state: PasswordUpdateStatusType) => void;
};

const useUserState = create<UserParams>((set) => ({
  authUser: null,
  profileUser: null,
  profileCollectionDocs: null,
  isFetchingAuthUser: false,
  activeUserMenu: false,
  activeProfileOptionsMenu: false,
  activeProfileEditModal: { active: false, profileUser: null },
  passwordResetStatus: PasswordUpdateStatus.INITIAL,

  closeProfileEditModal: () =>
    set({ activeProfileEditModal: { active: false, profileUser: null } }),

  setAuthUser: (data) => set({ authUser: data }),
  setProfileUser: (data) => set({ profileUser: data }),
  setProfileCollectionDocs: (data) => set({ profileCollectionDocs: data }),
  setIsFetchingAuthUser: (state) => set({ isFetchingAuthUser: state }),
  setActiveUserMenu: (state) => set({ activeUserMenu: state }),
  setActiveProfileOptionsMenu: (state) => set({ activeProfileOptionsMenu: state }),
  setActiveProfileEditModal: (state) => set({ activeProfileEditModal: state }),
  setPasswordResetStatus: (state) => set({ passwordResetStatus: state }),
}));

export default useUserState;
