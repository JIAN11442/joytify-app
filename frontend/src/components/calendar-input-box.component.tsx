import { forwardRef, useRef, useState } from "react";
import mergeRefs from "../lib/merge-refs.lib";
import { twMerge } from "tailwind-merge";

interface CalendarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  tw?: {
    title?: string;
    input?: string;
  };
}

const CalendarInputBox = forwardRef<HTMLInputElement, CalendarProps>(
  ({ id, title, onChange, className, tw, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [inputHasVal, setInputHasVal] = useState(false);

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      setInputHasVal(Boolean(val));

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div
        className={twMerge(
          `
        ${
          title &&
          `
            flex
            flex-col
            gap-2
          `
        }
      `,
          className
        )}
      >
        {/* title */}
        <>
          {title && (
            <p
              className={twMerge(
                `
                text-sm
                text-grey-custom/50
              `,
                tw?.title
              )}
            >
              {title}
            </p>
          )}
        </>

        {/* input */}
        <input
          ref={mergeRefs(inputRef, ref)}
          id={id}
          type="date"
          onChange={(e) => handleInputOnChange(e)}
          className={twMerge(
            `
            input-box
            ${!inputHasVal && "text-grey-custom/30"}
          `,
            tw?.input
          )}
          {...props}
        />
      </div>
    );
  }
);

export default CalendarInputBox;
