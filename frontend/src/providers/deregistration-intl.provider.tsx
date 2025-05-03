import { useMemo } from "react";
import { IntlProvider } from "react-intl";
import useLocaleState from "../states/locale.state";
import { loadLanguageMessages } from "../utils/locale.util";

type DeregistrationIntlProviderProps = {
  children: React.ReactNode;
};

const DeregistrationIntlProvider: React.FC<DeregistrationIntlProviderProps> = ({ children }) => {
  const { deregistrationPolicyLocale } = useLocaleState();

  const localeMessages = useMemo(() => {
    return loadLanguageMessages(deregistrationPolicyLocale);
  }, [deregistrationPolicyLocale]);

  if (!localeMessages) return null;

  return (
    <IntlProvider locale={deregistrationPolicyLocale} messages={localeMessages}>
      {children}
    </IntlProvider>
  );
};

export default DeregistrationIntlProvider;
