import { useCallback } from "react";
import { useIntl } from "react-intl";
import { PrimitiveType, FormatXMLElementFn, Options } from "intl-messageformat";

export type ScopedFormatMessage = (
  prefix: string
) => (
  id: string,
  values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>,
  opts?: Options
) => string;

export const useScopedIntl = () => {
  const intl = useIntl();

  const fm: ScopedFormatMessage = useCallback(
    (prefix: string) => (id, values, opts) =>
      intl.formatMessage({ id: `${prefix}.${id}` }, values, opts),
    [intl]
  );

  return { fm, intl };
};
