import { create } from "zustand";
import { OptionType } from "../components/multi-select-input-box.component";
import LabelOptions, { LabelType } from "../constants/label-type.constant";

type LabelModalType = {
  type: LabelType;
  active: boolean;
  options: OptionType | OptionType[] | null;
};

type UploadModalState = {
  activeUploadModal: boolean;
  activeAdvancedSettings: boolean;
  activeCreateLabelModal: LabelModalType;

  openUploadModal: () => void;
  closeUploadModal: () => void;
  setActiveAdvancedSettings: (active: boolean) => void;
  setActiveCreateLabelModal: (state: LabelModalType) => void;
};

const useUploadModalState = create<UploadModalState>((set) => ({
  activeUploadModal: false,
  activeAdvancedSettings: false,
  activeCreateLabelModal: {
    type: LabelOptions.NULL,
    active: false,
    options: null,
  },

  openUploadModal: () => set({ activeUploadModal: true }),
  closeUploadModal: () => set({ activeUploadModal: false }),
  setActiveAdvancedSettings: (active) =>
    set({ activeAdvancedSettings: active }),
  setActiveCreateLabelModal: (state) => set({ activeCreateLabelModal: state }),
}));

export default useUploadModalState;
