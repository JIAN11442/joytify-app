import { create } from "zustand";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { OptionType } from "../components/multi-select-input-box.component";
import { RefactorInputLabelResponse } from "@joytify/types/types";

export type RefetchType<T> = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<T | undefined, Error>>;

type ActiveCreateLabelModal = {
  active: boolean;
  options: OptionType | null;
  labelRefetch: RefetchType<RefactorInputLabelResponse> | null;
};

type ActiveCreatePlaylistModal = {
  active: boolean;
  options: string[] | null;
};

type ActiveCreateAlbumModal = {
  active: boolean;
  options: string[] | null;
};

type UploadModalState = {
  activeUploadModal: boolean;
  activeAdvancedSettings: boolean;
  activeCreateLabelModal: ActiveCreateLabelModal;
  activeCreatePlaylistModal: ActiveCreatePlaylistModal;
  activeCreateAlbumModal: ActiveCreateAlbumModal;

  openUploadModal: () => void;
  closeUploadModal: () => void;
  closeCreateAlbumModal: () => void;
  closeCreateLabelModal: () => void;
  closeCreatePlaylistModal: () => void;

  setActiveAdvancedSettings: (active: boolean) => void;
  setActiveCreateLabelModal: (state: ActiveCreateLabelModal) => void;
  setActiveCreatePlaylistModal: (state: ActiveCreatePlaylistModal) => void;
  setActiveCreateAlbumModal: (state: ActiveCreateAlbumModal) => void;
};

const initialLabelModalState: ActiveCreateLabelModal = {
  active: false,
  options: null,
  labelRefetch: null,
};

const useUploadModalState = create<UploadModalState>((set) => ({
  activeUploadModal: false,
  activeAdvancedSettings: false,
  activeCreateLabelModal: initialLabelModalState,
  activeCreateAlbumModal: { active: false, options: null },
  activeCreatePlaylistModal: { active: false, options: null },

  openUploadModal: () => set({ activeUploadModal: true }),
  closeUploadModal: () => set({ activeUploadModal: false, activeAdvancedSettings: false }),
  closeCreateLabelModal: () => set({ activeCreateLabelModal: initialLabelModalState }),
  closeCreateAlbumModal: () => set({ activeCreateAlbumModal: { active: false, options: null } }),
  closeCreatePlaylistModal: () =>
    set({ activeCreatePlaylistModal: { active: false, options: null } }),

  setActiveAdvancedSettings: (active) => set({ activeAdvancedSettings: active }),
  setActiveCreateLabelModal: (state) => set({ activeCreateLabelModal: state }),
  setActiveCreatePlaylistModal: (state) => set({ activeCreatePlaylistModal: state }),
  setActiveCreateAlbumModal: (state) => set({ activeCreateAlbumModal: state }),
}));

export default useUploadModalState;
