import { create } from "zustand";
import { SupportedLocale } from "@joytify/types/constants";
import { SupportedLocaleType } from "@joytify/types/types";

type LocaleState = {
  themeLocale: SupportedLocaleType;
  deregistrationPolicyLocale: SupportedLocaleType;
  setThemeLocale: (locale: SupportedLocaleType) => void;
  setDeregistrationPolicyLocale: (locale: SupportedLocaleType) => void;
};

const { EN_US } = SupportedLocale;

const useLocaleState = create<LocaleState>((set) => ({
  themeLocale: EN_US,
  deregistrationPolicyLocale: EN_US,
  setThemeLocale: (locale) => set({ themeLocale: locale }),
  setDeregistrationPolicyLocale: (locale) => set({ deregistrationPolicyLocale: locale }),
}));

export default useLocaleState;
