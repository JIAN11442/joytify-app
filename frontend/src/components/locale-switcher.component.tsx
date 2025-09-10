import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AiOutlineGlobal } from "react-icons/ai";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import MenuItem from "./menu-item.component";
import { localeMap } from "../contents/locale.content";
import { SupportedLocaleType } from "@joytify/types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type LocaleSwitcherProps = {
  localeState: {
    locale: SupportedLocaleType;
    setLocale: (locale: SupportedLocaleType) => void;
  };
  className?: string;
};

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ localeState, className }) => {
  const [activeLocaleMenu, setActiveLocaleMenu] = useState(false);
  const { locale, setLocale } = localeState;
  const { short } = localeMap[locale];

  const handleActiveLocaleMenu = () => {
    timeoutForDelay(() => {
      setActiveLocaleMenu(!activeLocaleMenu);
    });
  };

  const handleSetLocale = (locale: SupportedLocaleType) => {
    timeoutForDelay(() => {
      setLocale(locale);
    });
  };

  return (
    <div className={twMerge(`relative`, className)}>
      <button
        type="button"
        onClick={handleActiveLocaleMenu}
        className={`
          group
          flex
          p-2
          gap-2
          items-center
          justify-center
          text-blue-200
          hover:text-blue-400
          hover:scale-105
          rounded-full
          transition-all
        `}
      >
        <Icon name={AiOutlineGlobal} />
        <p>{short}</p>
      </button>

      {/* menu */}
      <Menu
        activeState={{
          visible: activeLocaleMenu,
          setVisible: setActiveLocaleMenu,
        }}
        wrapper={{ transformOrigin: "top right" }}
        className={`
          absolute
          right-8
          bg-neutral-100
          shadow-neutral-700/50
          border-none  
        `}
      >
        {Object.entries(localeMap).map(([key, value]) => {
          const { flag, native } = value;

          return (
            <MenuItem
              key={`${key}-menu-item`}
              onClick={() => handleSetLocale(key as SupportedLocaleType)}
              label={`${flag} ${native}`}
              className={`
                text-[14px]
                text-neutral-700 
                hover:bg-blue-200/50
                hover:text-neutral-700
                font-inter
                ${key === locale && "bg-neutral-200 no-hover"}
              `}
            />
          );
        })}
      </Menu>
    </div>
  );
};

export default LocaleSwitcher;
