import moment from "moment";
import "moment/dist/locale/zh-cn";
import "moment/dist/locale/zh-tw";
import "moment/dist/locale/ja";
import "moment/dist/locale/ko";
import "moment/dist/locale/ms";

import { SupportedLocaleType } from "@joytify/types/types";

const momentLocaleMap: Record<string, string> = {
  "en-US": "en",
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
  ja: "ja",
  ko: "ko",
  ms: "ms",
};

const shortDateFormatMap: Record<string, string> = {
  en: "D MMM",
  "zh-cn": "M月D日",
  "zh-tw": "M月D日",
  ja: "M月D日",
  ko: "M월 D일",
  ms: "D MMM",
};

export const getTimeAgo = (timestamp: string, locale: SupportedLocaleType) => {
  let timeAgo;

  const momentLocale = momentLocaleMap[locale] || "en";
  const shortFormat = shortDateFormatMap[momentLocale];
  const target = moment(timestamp).locale(momentLocale);
  const daysDiff = moment().diff(moment(timestamp), "days");

  // if the time ago is in month or year, then get the day or full day
  // otherwise, get the time ago
  if (daysDiff >= 365) {
    timeAgo = target.format("LL");
  } else if (daysDiff >= 30) {
    timeAgo = target.format(shortFormat);
  } else {
    timeAgo = target.fromNow();
  }

  return timeAgo;
};

export const getDuration = (second: number) => {
  const min = Math.floor(second / 60);
  const sec = Math.floor(second % 60);

  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};
