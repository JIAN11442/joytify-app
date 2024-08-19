import { create } from "zustand";

type SidebarState = {
  collapse: { isCollapsed: boolean; changeForScreenResize: boolean };
  setCollapse: (state: {
    isCollapsed: boolean;
    changeForScreenResize: boolean;
  }) => void;
};

const useSidebarState = create<SidebarState>((set) => ({
  collapse: { isCollapsed: false, changeForScreenResize: true },
  setCollapse: (state) => set({ collapse: state }),
}));

export default useSidebarState;
