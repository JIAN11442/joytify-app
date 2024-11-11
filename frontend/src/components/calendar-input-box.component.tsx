import { forwardRef, useRef, useState } from "react";
import mergeRefs from "../lib/merge-refs.lib";

interface CalendarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
}

const CalendarInputBox = forwardRef<HTMLInputElement, CalendarProps>(
  ({ id, title, onChange, ...props }, ref) => {
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
        className={`
        ${
          title &&
          `
            flex
            flex-col
            gap-2
          `
        }
      `}
      >
        {/* title */}
        <>
          {title && (
            <p
              className={`
                text-sm
                text-grey-custom/50
              `}
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
          className={`
            input-box
            ${!inputHasVal && "text-grey-custom/30"}
          `}
          {...props}
        />
      </div>
    );
  }
);

export default CalendarInputBox;
