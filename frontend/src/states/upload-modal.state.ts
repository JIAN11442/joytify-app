import { create } from "zustand";

type UploadModalState = {
  isActiveModal: boolean;
  isActiveAdvancedSettings: boolean;

  openUploadModal: () => void;
  closeUploadModal: () => void;
  setIsActiveAdvancedSettings: (active: boolean) => void;
};

const useUploadModalState = create<UploadModalState>((set) => ({
  isActiveModal: false,
  isActiveAdvancedSettings: false,

  openUploadModal: () => set({ isActiveModal: true }),
  closeUploadModal: () => set({ isActiveModal: false }),
  setIsActiveAdvancedSettings: (active) =>
    set({ isActiveAdvancedSettings: active }),
}));

export default useUploadModalState;
