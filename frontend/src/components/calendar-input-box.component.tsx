import { useEffect, useMemo, useState, forwardRef, useCallback } from "react";
import SingleSelectInputBox from "./single-select-input-box.component";

interface CalendarInputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  tw?: {
    input?: string;
    option?: string;
  };
}

type MonthKey = keyof typeof MONTH_MAP;
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

const getMonthName = (month: string) => {
  const monthName = Object.keys(MONTH_MAP).find((m) => MONTH_MAP[m as MonthKey] === month);
  return monthName;
};

const CalendarInputBox = forwardRef<HTMLInputElement, CalendarInputBoxProps>(
  ({ title, onChange, disabled, name, defaultValue = "", ...props }, ref) => {
    // memoized options
    const { days, months, years } = useMemo(
      () => ({
        days: Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")),
        months: Object.keys(MONTH_MAP) as MonthKey[],
        years: Array.from({ length: CURRENT_YEAR - YEAR_RANGE_START + 1 }, (_, i) =>
          (CURRENT_YEAR - i).toString()
        ),
      }),
      []
    );

    // parse default value
    const defaultDate = useMemo(() => {
      const [year, month, day] = (defaultValue as string).split("-");
      return { year, month: getMonthName(month), day };
    }, [defaultValue]);

    // date state
    const [date, setDate] = useState<DateType>({
      day: defaultDate.day || "",
      month: defaultDate.month || "",
      year: defaultDate.year || "",
    });

    // computed ISO date string
    const computedISODate = useMemo(() => {
      const { day, month, year } = date;
      if (day && month && year) {
        return `${year}-${MONTH_MAP[month as MonthKey]}-${day.padStart(2, "0")}`;
      }
      return "";
    }, [date]);

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

    // update date while defaultValue changes
    useEffect(() => {
      setDate({
        day: defaultDate.day || "",
        month: defaultDate.month || "",
        year: defaultDate.year || "",
      });
    }, [defaultDate]);

    return (
      <div className="flex flex-col w-full gap-2">
        {title && <p className="text-sm text-grey-custom/50">{title}</p>}

        <div className="flex gap-2 items-center justify-evenly">
          <SingleSelectInputBox
            placeholder="DD"
            defaultValue={defaultDate.day}
            options={days}
            filterMode="starts-with"
            onChange={(e) => handleOnChange(e, "day")}
            disabled={disabled}
            tw={DEFAULT_TW}
          />

          <SingleSelectInputBox
            placeholder="MM"
            defaultValue={defaultDate.month}
            options={months}
            filterMode="starts-with"
            onChange={(e) => handleOnChange(e, "month")}
            disabled={disabled}
            tw={DEFAULT_TW}
          />

          <SingleSelectInputBox
            placeholder="YYYY"
            defaultValue={defaultDate.year}
            options={years}
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
