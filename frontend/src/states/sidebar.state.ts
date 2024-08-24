import { create } from "zustand";

type SidebarState = {
  collapseSideBarState: {
    isCollapsed: boolean;
    changeForScreenResize: boolean;
  };
  floating: boolean;
  disabledCollapseFn: boolean;

  setCollapseSideBarState: (state: {
    isCollapsed: boolean;
    changeForScreenResize: boolean;
  }) => void;
  setFloating: (state: boolean) => void;
  setDisabledCollapseFn: (state: boolean) => void;
};

const useSidebarState = create<SidebarState>((set) => ({
  collapseSideBarState: { isCollapsed: false, changeForScreenResize: true },
  floating: false,
  disabledCollapseFn: false,

  setCollapseSideBarState: (state) => set({ collapseSideBarState: state }),
  setFloating: (state) => set({ floating: state }),
  setDisabledCollapseFn: (state) => set({ disabledCollapseFn: state }),
}));

export default useSidebarState;
