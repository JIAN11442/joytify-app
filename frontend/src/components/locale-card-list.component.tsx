import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import Icon from "./react-icons.component";
import LocaleCard from "./locale-card.component";
import AnimationWrapper from "./animation-wrapper.component";
import { LocaleMap } from "../contents/locale.content";
import { SupportedLocaleType } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import useLocaleState from "../states/locale.state";

type LocaleCardListProps = {
  locales: LocaleMap | null;
  searchQuery: string;
  onSelectedLocaleChange?: (locale: SupportedLocaleType) => void;
};

const LocaleCardList: React.FC<LocaleCardListProps> = ({
  locales,
  searchQuery,
  onSelectedLocaleChange,
}) => {
  const hasLocales = locales && Object.keys(locales).length > 0;

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocaleType | null>(null);

  const { themeLocale } = useLocaleState();
  const { collapseSideBarState } = useSidebarState();

  useEffect(() => {
    if (selectedLocale) {
      onSelectedLocaleChange?.(selectedLocale);
    }
  }, [selectedLocale]);

  if (!hasLocales) {
    return (
      <div className={`flex h-full mt-20 justify-center`}>
        <p className={`text-center text-neutral-500`}>
          <FormattedMessage
            id={`settings.languages.noFound`}
            values={{
              searchQuery: searchQuery,
              strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
            }}
          />
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        grid
        grid-cols-1
        ${
          collapseSideBarState?.isCollapsed
            ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "max-lg:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
        }
        gap-4
      `}
    >
      {Object.entries(locales as LocaleMap).map(([localeKey, localeInfo]) => {
        const isCurrentLocale = localeKey === themeLocale;
        const isSelectedLocale = selectedLocale === localeKey;

        return (
          <LocaleCard
            key={`settings-languages-${localeKey}`}
            localeInfo={localeInfo}
            onClick={() => setSelectedLocale(localeKey as SupportedLocaleType)}
            className={`
              hover:shadow-green-500
              hover:bg-green-300/5
              ${
                isSelectedLocale
                  ? "bg-green-500/5 border-green-500 shadow-green-500/50 no-hover"
                  : "border-neutral-800"
              }
            `}
          >
            <AnimationWrapper
              visible={isCurrentLocale || isSelectedLocale}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex p-2 bg-green-500 rounded-full`}
            >
              <Icon
                name={FaArrowRightArrowLeft}
                opts={{ size: 10 }}
                className={`text-neutral-900`}
              />
            </AnimationWrapper>
          </LocaleCard>
        );
      })}
    </div>
  );
};

export default LocaleCardList;
