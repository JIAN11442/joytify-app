import { create } from "zustand";

type ProviderState = {
  screenWidth: number;
  screenHeight: number;

  setScreenWidth: (width: number) => void;
  setScreenHeight: (height: number) => void;
};

const useProviderState = create<ProviderState>((set) => ({
  screenWidth: 0,
  screenHeight: 0,

  setScreenHeight: (height) => set({ screenHeight: height }),
  setScreenWidth: (width) => set({ screenWidth: width }),
}));

export default useProviderState;
