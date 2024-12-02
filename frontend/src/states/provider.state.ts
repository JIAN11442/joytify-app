import { create } from "zustand";

type ScrollType = {
  visible: boolean;
  position: number;
};

type ProviderState = {
  screenWidth: number;
  screenHeight: number;
  scrollbarVisible: ScrollType;

  setScreenWidth: (width: number) => void;
  setScreenHeight: (height: number) => void;
  setScrollbarVisible: (state: ScrollType) => void;
};

const useProviderState = create<ProviderState>((set) => ({
  screenWidth: 0,
  screenHeight: 0,
  scrollbarVisible: { visible: false, position: 0 },

  setScreenHeight: (height) => set({ screenHeight: height }),
  setScreenWidth: (width) => set({ screenWidth: width }),
  setScrollbarVisible: (state) => set({ scrollbarVisible: state }),
}));

export default useProviderState;
