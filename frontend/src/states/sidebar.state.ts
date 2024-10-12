import { create } from "zustand";

type SidebarState = {
  collapseSideBarState: {
    isCollapsed: boolean;
    changeForScreenResize: boolean;
  };
  floating: boolean;

  setCollapseSideBarState: (state: {
    isCollapsed: boolean;
    changeForScreenResize: boolean;
  }) => void;
  setFloating: (state: boolean) => void;
};

const useSidebarState = create<SidebarState>((set) => ({
  collapseSideBarState: { isCollapsed: false, changeForScreenResize: true },
  floating: false,

  setCollapseSideBarState: (state) => set({ collapseSideBarState: state }),
  setFloating: (state) => set({ floating: state }),
}));

export default useSidebarState;
