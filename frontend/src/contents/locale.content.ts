import { SupportedLocale } from "@joytify/types/constants";

export type LocaleMapFields = {
  flag: string;
  short: string;
  native: string;
  display: string;
};

export type LocaleMap = Record<SupportedLocale, LocaleMapFields>;

export const localeMap: LocaleMap = {
  [SupportedLocale.EN_US]: {
    flag: "🇺🇸",
    short: "EN",
    native: "English",
    display: "English",
  },
  [SupportedLocale.ZH_TW]: {
    flag: "🇹🇼",
    short: "TW",
    native: "繁體中文(台灣)",
    display: "Chinese (Traditional) Taiwan",
  },
  [SupportedLocale.ZH_CN]: {
    flag: "🇨🇳",
    short: "CN",
    native: "简体中文",
    display: "Chinese (Simplified)",
  },
  [SupportedLocale.JA]: {
    flag: "🇯🇵",
    short: "JA",
    native: "日本語",
    display: "Japanese",
  },
  [SupportedLocale.KO]: {
    flag: "🇰🇷",
    short: "KO",
    native: "한국어",
    display: "Korean",
  },
  [SupportedLocale.MS]: {
    flag: "🇲🇾",
    short: "MS",
    native: "Melayu",
    display: "Malay",
  },
};
