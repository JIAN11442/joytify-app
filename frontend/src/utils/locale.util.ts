import enUS from "../locales/en-US/index.en-US";
import zhTW from "../locales/zh-TW/index.zh-TW";
import zhCN from "../locales/zh-CN/index.zh-CN";
import ja from "../locales/ja/index.ja";
import ko from "../locales/ko/index.ko";
import ms from "../locales/ms/index.ms";

import { SupportedLocaleType } from "@joytify/types/types";

export const LANGUAGE_FILES = {
  "en-US": enUS,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  ja: ja,
  ko: ko,
  ms: ms,
};

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_FILES);

export const loadLanguageMessages = (locale: SupportedLocaleType) => {
  return LANGUAGE_FILES[locale as keyof typeof LANGUAGE_FILES];
};
