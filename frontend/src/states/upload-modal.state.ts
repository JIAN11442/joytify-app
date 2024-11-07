import { create } from "zustand";
import { OptionType } from "../components/multi-select-input-box.component";
import LabelOptions, { LabelType } from "../constants/label-type.constant";

type LabelModalType = {
  type: LabelType;
  active: boolean;
  options: OptionType | OptionType[] | null;
};

type PlaylistModalType = {
  active: boolean;
  options: string[] | null;
};

type UploadModalState = {
  activeUploadModal: boolean;
  activeAdvancedSettings: boolean;
  activeCreateLabelModal: LabelModalType;
  activeCreatePlaylistModal: PlaylistModalType;

  openUploadModal: () => void;
  closeUploadModal: () => void;
  setActiveAdvancedSettings: (active: boolean) => void;
  setActiveCreateLabelModal: (state: LabelModalType) => void;
  setActiveCreatePlaylistModal: (state: PlaylistModalType) => void;
};

const useUploadModalState = create<UploadModalState>((set) => ({
  activeUploadModal: false,
  activeAdvancedSettings: false,
  activeCreateLabelModal: {
    type: LabelOptions.NULL,
    active: false,
    options: null,
  },
  activeCreatePlaylistModal: { active: false, options: null },

  openUploadModal: () => set({ activeUploadModal: true }),
  closeUploadModal: () =>
    set({ activeUploadModal: false, activeAdvancedSettings: false }),
  setActiveAdvancedSettings: (active) =>
    set({ activeAdvancedSettings: active }),
  setActiveCreateLabelModal: (state) => set({ activeCreateLabelModal: state }),
  setActiveCreatePlaylistModal: (state) =>
    set({ activeCreatePlaylistModal: state }),
}));

export default useUploadModalState;
