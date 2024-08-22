import { create } from "zustand";

type UploadModalState = {
  isActive: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
};

const useUploadModalState = create<UploadModalState>((set) => ({
  isActive: false,
  openUploadModal: () => set({ isActive: true }),
  closeUploadModal: () => set({ isActive: false }),
}));

export default useUploadModalState;
