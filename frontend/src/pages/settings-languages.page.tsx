import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { HiOutlineTranslate } from "react-icons/hi";

import Loader from "../components/loader.component";
import Icon from "../components/react-icons.component";
import LocaleCard from "../components/locale-card.component";
import SearchBarInput from "../components/searchbar-input.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import LocaleCardList from "../components/locale-card-list.component";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { LocaleMap, localeMap } from "../contents/locale.content";
import { SupportedLocaleType } from "@joytify/types/types";
import useLocaleState from "../states/locale.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const SettingsLanguagesPage = () => {
  const { fm } = useScopedIntl();
  const settingsLanguagesFm = fm("settings.languages");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterLocales, setFilterLocales] = useState<LocaleMap | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocaleType | null>(null);

  const { themeLocale, setThemeLocale } = useLocaleState();
  const { mutate: updateUserPreferencesFn, isPending } = useUpdateUserPreferencesMutation();

  const [currentLocaleInfo, selectableLocales] = useMemo(() => {
    const currentLocaleInfo = localeMap[themeLocale];
    const selectableLocales = Object.fromEntries(
      Object.entries(localeMap).filter(([localeKey]) => localeKey !== themeLocale)
    ) as LocaleMap;

    return [currentLocaleInfo, selectableLocales];
  }, [localeMap, themeLocale]);

  const hasPendingLocaleChange = useMemo(() => {
    return selectedLocale !== themeLocale;
  }, [selectedLocale, themeLocale]);

  const hasFilterLocales = useMemo(() => {
    return filterLocales && Object.keys(filterLocales).length > 0;
  }, [filterLocales]);

  const handleFilterLocales = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();

      const filterOpts = Object.fromEntries(
        Object.entries(selectableLocales).filter(([, locale]) => {
          const { display, native, short } = locale;
          return (
            display.toLowerCase().startsWith(value) ||
            native.toLowerCase().startsWith(value) ||
            short.toLowerCase().startsWith(value)
          );
        })
      ) as LocaleMap;

      timeoutForDelay(() => {
        setSearchQuery(value);
        setFilterLocales(filterOpts);
      });
    },
    [selectableLocales]
  );

  const handleCancelSelected = useCallback(() => {
    timeoutForDelay(() => {
      setSelectedLocale(themeLocale);
    });
  }, [themeLocale]);

  const handleSwitchLocale = useCallback(() => {
    timeoutForDelay(() => {
      if (selectedLocale) {
        setThemeLocale(selectedLocale);
        updateUserPreferencesFn({ locale: selectedLocale });
      }
    });
  }, [selectedLocale]);

  // initialize filter locales
  useEffect(() => {
    timeoutForDelay(() => {
      setFilterLocales(selectableLocales);
    });
  }, [selectableLocales]);

  // initialize selected locale
  useEffect(() => {
    timeoutForDelay(() => {
      setSelectedLocale(themeLocale);
    });
  }, [themeLocale]);

  return (
    <div className={`page-container`}>
      {/* title */}
      <AnimationWrapper
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col`}
      >
        {/* title */}
        <PageSectionTitle
          icon={{ name: HiOutlineTranslate }}
          title={settingsLanguagesFm("title")}
          description={settingsLanguagesFm("description")}
        />

        {/* currently selected locale */}
        <LocaleCard
          localeInfo={currentLocaleInfo}
          className={`
            my-5
            bg-blue-500/5
            border-blue-400/50
            shadow-blue-900
            pointer-events-none
          `}
        >
          <p
            className={`
              absolute
              right-3
              text-sm
              text-blue-600
              max-sm:hidden
            `}
          >
            {settingsLanguagesFm("currentlySelected")}
          </p>

          <div
            className={`
              flex
              p-2
              bg-blue-500
              items-center
              justify-center
              rounded-full
              sm:hidden
          `}
          >
            <Icon name={FaCheck} opts={{ size: 10 }} className={`text-neutral-900`} />
          </div>
        </LocaleCard>

        {/* searchbar */}
        <SearchBarInput
          id="settings-languages-searchbar"
          placeholder={settingsLanguagesFm("search.placeholder")}
          icon={{ name: BiSearch, opts: { size: 22 } }}
          onChange={handleFilterLocales}
          visible={true}
          autoComplete="off"
          className={`py-5 my-4`}
        />
      </AnimationWrapper>

      {/* options */}
      <AnimationWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex
          flex-col
          w-full
          gap-5
        `}
      >
        <LocaleCardList
          locales={filterLocales}
          searchQuery={searchQuery}
          onSelectedLocaleChange={(locale) => setSelectedLocale(locale)}
        />

        {/* submit buttons */}
        {hasFilterLocales && (
          <div
            className={`
              flex
              justify-end
              gap-4
              mt-5
            `}
          >
            {/* cancel */}
            <button
              type="button"
              disabled={!hasPendingLocaleChange}
              onClick={handleCancelSelected}
              className={`
                locale-submit-btn
                bg-neutral-900
                border-neutral-700
                hover:bg-neutral-800
              `}
            >
              {settingsLanguagesFm("button.cancel")}
            </button>

            {/* save changes */}
            <button
              type="submit"
              disabled={!hasPendingLocaleChange}
              onClick={handleSwitchLocale}
              className={`
              locale-submit-btn
              ${
                hasPendingLocaleChange &&
                `
                  shadow-[0_0_10px_0_rgba(0,0,0,0.5)]
                  animate-shadow-pulse-3
                  shadow-green-600
                `
              }
            `}
            >
              {isPending ? <Loader loader={{ size: 20 }} /> : settingsLanguagesFm("button.save")}
            </button>
          </div>
        )}
      </AnimationWrapper>
    </div>
  );
};

export default SettingsLanguagesPage;
