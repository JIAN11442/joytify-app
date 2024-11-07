import { create } from "zustand";

type LabelState = {
  deletedLabel: string;
  setDeletedLabel: (title: string) => void;
};

const useLabelState = create<LabelState>((set) => ({
  deletedLabel: "",
  setDeletedLabel: (title) => set({ deletedLabel: title }),
}));

export default useLabelState;
