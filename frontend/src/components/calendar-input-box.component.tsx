import { IntlShape } from "react-intl";
import { useEffect, useMemo, useState, forwardRef, useCallback } from "react";
import SingleSelectInputBox from "./single-select-input-box.component";

interface CalendarInputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  datePlaceholder?: {
    day?: string;
    month?: string;
    year?: string;
  };
  intl?: IntlShape;
  tw?: {
    input?: string;
    option?: string;
  };
}

type DateType = {
  day: string;
  month: string;
  year: string;
};

const MONTH_MAP = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
} as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE_START = 1900;

const DEFAULT_TW = { input: "font-montserrat", option: "font-montserrat" };

const getMonthName = (month: string, monthMap: Record<string, string>) => {
  const monthName = Object.keys(monthMap).find((m) => monthMap[m] === month);
  return monthName;
};

const CalendarInputBox = forwardRef<HTMLInputElement, CalendarInputBoxProps>(
  (
    { title, datePlaceholder, intl, onChange, disabled, name, defaultValue = "", ...props },
    ref
  ) => {
    const [date, setDate] = useState<DateType>({ day: "", month: "", year: "" });

    // memoized month map
    const monthMap = useMemo(() => {
      return intl
        ? Object.fromEntries(
            Object.entries(MONTH_MAP).map(([key, value]) => [
              intl?.formatMessage({ id: `month.${key}` }),
              value,
            ])
          )
        : MONTH_MAP;
    }, [intl, MONTH_MAP]);

    // memoized options
    const { DAYS, MONTHS, YEARS } = useMemo(
      () => ({
        DAYS: Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")),
        MONTHS: Object.keys(monthMap),
        YEARS: Array.from({ length: CURRENT_YEAR - YEAR_RANGE_START + 1 }, (_, i) =>
          (CURRENT_YEAR - i).toString()
        ),
      }),
      [monthMap]
    );

    // parse default value
    const defaultDate = useMemo(() => {
      const [year, month, day] = (defaultValue as string).split("-");
      return { year, month: getMonthName(month, monthMap), day };
    }, [monthMap, defaultValue]);

    // computed ISO date string
    const computedISODate = useMemo(() => {
      const { day, month, year } = date;

      if (day || month || year) {
        return `${year}-${monthMap[month as keyof typeof monthMap]}-${day.padStart(2, "0")}`;
      }

      return "";
    }, [monthMap, date]);

    const handleOnChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof date) => {
        const value = e.target.value;

        setDate((prev) => ({
          ...prev,
          [field]: value,
        }));
      },
      []
    );

    // initialize date state with defaultDate
    useEffect(() => {
      // 1. set initial values for all inputs
      // 2. enable tracking of any input change as a valid modification when defaultValue is present
      setDate({
        day: defaultDate.day || "",
        month: defaultDate.month || "",
        year: defaultDate.year || "",
      });
    }, [defaultDate]);

    // sync with parent form
    useEffect(() => {
      if (onChange && name) {
        onChange({
          target: {
            name,
            value: computedISODate,
            type: "date",
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }, [computedISODate, name, onChange]);

    return (
      <div className="flex flex-col w-full gap-2">
        {title && <p className="text-sm text-grey-custom/50">{title}</p>}

        <div className="flex gap-2 items-center justify-evenly">
          <SingleSelectInputBox
            placeholder={datePlaceholder?.day ?? "DD"}
            defaultValue={defaultDate.day}
            options={DAYS}
            filterMode="starts-with"
            onChange={(e) => handleOnChange(e, "day")}
            disabled={disabled}
            tw={DEFAULT_TW}
          />

          <SingleSelectInputBox
            placeholder={datePlaceholder?.month ?? "MM"}
            defaultValue={defaultDate.month}
            options={MONTHS}
            filterMode="starts-with"
            onChange={(e) => handleOnChange(e, "month")}
            disabled={disabled}
            tw={DEFAULT_TW}
          />

          <SingleSelectInputBox
            placeholder={datePlaceholder?.year ?? "YYYY"}
            defaultValue={defaultDate.year}
            options={YEARS}
            filterMode="starts-with"
            onChange={(e) => handleOnChange(e, "year")}
            disabled={disabled}
            tw={DEFAULT_TW}
          />
        </div>

        <input ref={ref} type="hidden" name={name} value={computedISODate} readOnly {...props} />
      </div>
    );
  }
);

export default CalendarInputBox;
