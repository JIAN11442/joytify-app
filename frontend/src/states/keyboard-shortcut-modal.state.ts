import { create } from "zustand";

type KeyboardShortcutModalState = {
  activeKeyboardShortcutModal: boolean;

  openKeyboardShortcutModal: () => void;
  closeKeyboardShortcutModal: () => void;
  setActiveKeyboardShortcutModal: (active: boolean) => void;
};

const useKeyboardShortcutModalState = create<KeyboardShortcutModalState>((set) => ({
  activeKeyboardShortcutModal: false,

  openKeyboardShortcutModal: () => set({ activeKeyboardShortcutModal: true }),
  closeKeyboardShortcutModal: () => set({ activeKeyboardShortcutModal: false }),
  setActiveKeyboardShortcutModal: (active) => set({ activeKeyboardShortcutModal: active }),
}));

export default useKeyboardShortcutModalState;
