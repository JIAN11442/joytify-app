import { useMemo } from "react";
import { IntlProvider } from "react-intl";
import useLocaleState from "../states/locale.state";
import { loadLanguageMessages } from "../utils/locale.util";

type ThemeIntlProviderProps = {
  children: React.ReactNode;
};

const ThemeIntlProvider: React.FC<ThemeIntlProviderProps> = ({ children }) => {
  const { themeLocale } = useLocaleState();
  const localeMessages = useMemo(() => loadLanguageMessages(themeLocale), [themeLocale]);

  if (!localeMessages) return null;

  return (
    <IntlProvider locale={themeLocale} messages={localeMessages}>
      {children}
    </IntlProvider>
  );
};

export default ThemeIntlProvider;
